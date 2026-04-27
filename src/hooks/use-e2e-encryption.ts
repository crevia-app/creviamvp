import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  initUserKeys,
  getUserPrivateKey,
  generateRoomKey,
  wrapRoomKey,
  unwrapRoomKey,
  encryptMessage,
  decryptMessage,
  cacheRoomKey,
  getCachedRoomKey,
  clearRoomKeyCache,
  isEncryptedContent,
  backupPrivateKey,
  restorePrivateKey,
} from "@/lib/e2e-crypto";

export function useE2EEncryption(currentUserId: string) {
  const [e2eReady, setE2eReady] = useState(false);
  const publicKeyRef = useRef<JsonWebKey | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  const initEncryption = useCallback(async () => {
    if (!currentUserId || initPromiseRef.current) return;

    initPromiseRef.current = (async () => {
      try {
        const { publicKeyJwk, isNew } = await initUserKeys(currentUserId);
        publicKeyRef.current = publicKeyJwk;

        const privateKey = await getUserPrivateKey(currentUserId);

        if (isNew && privateKey) {
          // New key pair — back it up encrypted to Supabase immediately
          const { encryptedKey, saltBase64 } = await backupPrivateKey(currentUserId, privateKey);
          await supabase.from("user_encryption_keys" as any).upsert(
            {
              user_id: currentUserId,
              public_key: JSON.stringify(publicKeyJwk),
              encrypted_private_key: encryptedKey,
              key_salt: saltBase64,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        } else {
          // Existing key — check if backup exists in DB; if not, create it now
          const { data: existing } = await supabase
            .from("user_encryption_keys" as any)
            .select("id, encrypted_private_key")
            .eq("user_id", currentUserId)
            .maybeSingle() as any;

          if (!existing) {
            // First time in DB — save public key + backup
            if (privateKey) {
              const { encryptedKey, saltBase64 } = await backupPrivateKey(currentUserId, privateKey);
              await supabase.from("user_encryption_keys" as any).insert({
                user_id: currentUserId,
                public_key: JSON.stringify(publicKeyJwk),
                encrypted_private_key: encryptedKey,
                key_salt: saltBase64,
              });
            } else {
              await supabase.from("user_encryption_keys" as any).insert({
                user_id: currentUserId,
                public_key: JSON.stringify(publicKeyJwk),
              });
            }
          } else if (!existing.encrypted_private_key && privateKey) {
            // Existing DB record but no backup yet (pre-migration users) — add backup now
            const { encryptedKey, saltBase64 } = await backupPrivateKey(currentUserId, privateKey);
            await supabase
              .from("user_encryption_keys" as any)
              .update({
                encrypted_private_key: encryptedKey,
                key_salt: saltBase64,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", currentUserId);
          }
        }

        setE2eReady(true);
      } catch (err) {
        console.error("E2EE init failed:", err);
        setE2eReady(true); // Degrade gracefully — chat still works, just unencrypted
      }
    })();

    await initPromiseRef.current;
  }, [currentUserId]);

  // Gets the user's private key from IndexedDB, falling back to the encrypted Supabase backup.
  // This is the cross-device fix: new devices decrypt the backup and cache locally.
  const getOrRestorePrivateKey = useCallback(async (): Promise<CryptoKey | null> => {
    const cached = await getUserPrivateKey(currentUserId);
    if (cached) return cached;

    const { data } = await supabase
      .from("user_encryption_keys" as any)
      .select("encrypted_private_key, key_salt")
      .eq("user_id", currentUserId)
      .maybeSingle() as any;

    if (!data?.encrypted_private_key || !data?.key_salt) return null;

    try {
      return await restorePrivateKey(currentUserId, data.encrypted_private_key, data.key_salt);
    } catch (err) {
      console.error("Failed to restore private key from backup:", err);
      return null;
    }
  }, [currentUserId]);

  const getPublicKey = useCallback(async (userId: string): Promise<JsonWebKey | null> => {
    const { data } = await supabase
      .from("user_encryption_keys" as any)
      .select("public_key")
      .eq("user_id", userId)
      .maybeSingle() as any;

    if (data?.public_key) {
      return JSON.parse(data.public_key);
    }
    return null;
  }, []);

  const setupRoomEncryption = useCallback(async (roomId: string, memberUserIds: string[]) => {
    if (!currentUserId) return;

    const privateKey = await getOrRestorePrivateKey();
    if (!privateKey) return;

    const roomKey = await generateRoomKey();
    await cacheRoomKey(roomId, roomKey);

    for (const memberId of memberUserIds) {
      const memberPublicKey = await getPublicKey(memberId);
      if (!memberPublicKey) continue;

      try {
        const encryptedKey = await wrapRoomKey(roomKey, privateKey, memberPublicKey);
        await supabase.from("room_encrypted_keys" as any).upsert(
          {
            room_id: roomId,
            user_id: memberId,
            encrypted_by: currentUserId,
            encrypted_key: encryptedKey,
          },
          { onConflict: "room_id,user_id" }
        );
      } catch (err) {
        console.error(`Failed to wrap key for ${memberId}:`, err);
      }
    }
  }, [currentUserId, getPublicKey, getOrRestorePrivateKey]);

  const getRoomKey = useCallback(async (roomId: string): Promise<CryptoKey | null> => {
    const cached = await getCachedRoomKey(roomId);
    if (cached) return cached;

    if (!currentUserId) return null;
    const privateKey = await getOrRestorePrivateKey();
    if (!privateKey) return null;

    const { data: keyRecord } = await supabase
      .from("room_encrypted_keys" as any)
      .select("encrypted_key, encrypted_by")
      .eq("room_id", roomId)
      .eq("user_id", currentUserId)
      .maybeSingle() as any;

    if (!keyRecord?.encrypted_key) return null;

    const encryptorPublicKey = await getPublicKey(keyRecord.encrypted_by);
    if (!encryptorPublicKey) return null;

    try {
      const roomKey = await unwrapRoomKey(
        keyRecord.encrypted_key,
        privateKey,
        encryptorPublicKey
      );
      await cacheRoomKey(roomId, roomKey);
      return roomKey;
    } catch (err) {
      console.warn("Failed to unwrap room key:", err);
      return null;
    }
  }, [currentUserId, getPublicKey, getOrRestorePrivateKey]);

  const encrypt = useCallback(async (plaintext: string, roomId: string): Promise<string | null> => {
    const roomKey = await getRoomKey(roomId);
    if (!roomKey) return null;
    return encryptMessage(plaintext, roomKey);
  }, [getRoomKey]);

  const decrypt = useCallback(async (ciphertext: string, roomId: string): Promise<string> => {
    if (!isEncryptedContent(ciphertext)) return ciphertext;
    const roomKey = await getRoomKey(roomId);
    if (!roomKey) return "🔒 Encrypted message";
    const result = await decryptMessage(ciphertext, roomKey);
    if (result === "[Unable to decrypt message]") {
      await clearRoomKeyCache(roomId);
      const freshKey = await getRoomKey(roomId);
      if (!freshKey) return "🔒 Encrypted message";
      const retry = await decryptMessage(ciphertext, freshKey);
      return retry === "[Unable to decrypt message]" ? "🔒 Encrypted message" : retry;
    }
    return result;
  }, [getRoomKey]);

  const decryptMessages = useCallback(async (
    messages: Array<{ content: string | null; room_id: string; is_encrypted: boolean; [key: string]: any }>
  ) => {
    const roomKeys = new Map<string, CryptoKey | null>();

    return Promise.all(
      messages.map(async (msg) => {
        if (!msg.content || !msg.is_encrypted) return msg;

        let roomKey = roomKeys.get(msg.room_id);
        if (roomKey === undefined) {
          roomKey = await getRoomKey(msg.room_id);
          roomKeys.set(msg.room_id, roomKey);
        }

        if (!roomKey) {
          return {
            ...msg,
            content: isEncryptedContent(msg.content) ? "[Encryption key unavailable]" : msg.content,
          };
        }

        if (isEncryptedContent(msg.content)) {
          let decrypted = await decryptMessage(msg.content, roomKey);
          if (decrypted === "[Unable to decrypt message]") {
            await clearRoomKeyCache(msg.room_id);
            const freshKey = await getRoomKey(msg.room_id);
            if (freshKey) {
              const retry = await decryptMessage(msg.content, freshKey);
              decrypted = retry === "[Unable to decrypt message]" ? "🔒 Encrypted message" : retry;
              roomKeys.set(msg.room_id, freshKey);
            } else {
              decrypted = "🔒 Encrypted message";
            }
          }
          return { ...msg, content: decrypted };
        }
        return msg;
      })
    );
  }, [getRoomKey]);

  // Redistributes the EXISTING room key to all members without generating a new one.
  // Call this when a member can't decrypt — the person who HAS the key runs this.
  const redistributeRoomKey = useCallback(async (roomId: string, memberUserIds: string[]): Promise<boolean> => {
    if (!currentUserId) return false;
    const roomKey = await getRoomKey(roomId);
    if (!roomKey) return false; // caller doesn't have the key — can't redistribute

    const privateKey = await getOrRestorePrivateKey();
    if (!privateKey) return false;

    for (const memberId of memberUserIds) {
      const memberPublicKey = await getPublicKey(memberId);
      if (!memberPublicKey) continue;
      try {
        const encryptedKey = await wrapRoomKey(roomKey, privateKey, memberPublicKey);
        await supabase.from("room_encrypted_keys" as any).upsert(
          { room_id: roomId, user_id: memberId, encrypted_by: currentUserId, encrypted_key: encryptedKey },
          { onConflict: "room_id,user_id" }
        );
      } catch (err) {
        console.error(`Failed to redistribute key for ${memberId}:`, err);
      }
    }
    return true;
  }, [currentUserId, getRoomKey, getOrRestorePrivateKey, getPublicKey]);

  return {
    e2eReady,
    initEncryption,
    setupRoomEncryption,
    redistributeRoomKey,
    encrypt,
    decrypt,
    decryptMessages,
    getRoomKey,
  };
}
