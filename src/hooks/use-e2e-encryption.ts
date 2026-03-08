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
  isEncryptedContent,
} from "@/lib/e2e-crypto";

export function useE2EEncryption(currentUserId: string) {
  const [e2eReady, setE2eReady] = useState(false);
  const publicKeyRef = useRef<JsonWebKey | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize user keys (generate if needed, store public key in DB)
  const initEncryption = useCallback(async () => {
    if (!currentUserId || initPromiseRef.current) return;
    
    initPromiseRef.current = (async () => {
      try {
        const { publicKeyJwk, isNew } = await initUserKeys(currentUserId);
        publicKeyRef.current = publicKeyJwk;

        if (isNew) {
          // Store public key in database
          await supabase.from("user_encryption_keys" as any).upsert(
            {
              user_id: currentUserId,
              public_key: JSON.stringify(publicKeyJwk),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        } else {
          // Ensure DB has our key
          const { data: existing } = await supabase
            .from("user_encryption_keys" as any)
            .select("id")
            .eq("user_id", currentUserId)
            .single();

          if (!existing) {
            await supabase.from("user_encryption_keys" as any).insert({
              user_id: currentUserId,
              public_key: JSON.stringify(publicKeyJwk),
            });
          }
        }

        setE2eReady(true);
      } catch (err) {
        console.error("E2EE init failed:", err);
        setE2eReady(true); // Still allow chat to work
      }
    })();
    
    await initPromiseRef.current;
  }, [currentUserId]);

  // Get another user's public key from DB
  const getPublicKey = useCallback(async (userId: string): Promise<JsonWebKey | null> => {
    const { data } = await supabase
      .from("user_encryption_keys" as any)
      .select("public_key")
      .eq("user_id", userId)
      .single() as any;

    if (data?.public_key) {
      return JSON.parse(data.public_key);
    }
    return null;
  }, []);

  // Setup room encryption (create room key and distribute to members)
  const setupRoomEncryption = useCallback(async (roomId: string, memberUserIds: string[]) => {
    if (!currentUserId) return;

    const privateKey = await getUserPrivateKey(currentUserId);
    if (!privateKey) return;

    const roomKey = await generateRoomKey();
    await cacheRoomKey(roomId, roomKey);

    // Get all members' public keys and wrap the room key for each
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
  }, [currentUserId, getPublicKey]);

  // Get the room key (from cache or unwrap from DB)
  const getRoomKey = useCallback(async (roomId: string): Promise<CryptoKey | null> => {
    // Check cache first
    const cached = await getCachedRoomKey(roomId);
    if (cached) return cached;

    if (!currentUserId) return null;
    const privateKey = await getUserPrivateKey(currentUserId);
    if (!privateKey) return null;

    // Get our encrypted key from DB
    const { data: keyRecord } = await supabase
      .from("room_encrypted_keys" as any)
      .select("encrypted_key, encrypted_by")
      .eq("room_id", roomId)
      .eq("user_id", currentUserId)
      .single() as any;

    if (!keyRecord?.encrypted_key) return null;

    // Get the public key of the person who encrypted it for us
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
      console.warn("Failed to unwrap room key, clearing stale cache:", err);
      // Clear any stale cached key
      return null;
    }
  }, [currentUserId, getPublicKey]);

  // Encrypt a message for a room
  const encrypt = useCallback(async (plaintext: string, roomId: string): Promise<string | null> => {
    const roomKey = await getRoomKey(roomId);
    if (!roomKey) return null;
    return encryptMessage(plaintext, roomKey);
  }, [getRoomKey]);

  // Decrypt a message from a room
  const decrypt = useCallback(async (ciphertext: string, roomId: string): Promise<string> => {
    if (!isEncryptedContent(ciphertext)) return ciphertext;
    const roomKey = await getRoomKey(roomId);
    if (!roomKey) return "[Encryption key unavailable]";
    return decryptMessage(ciphertext, roomKey);
  }, [getRoomKey]);

  // Decrypt multiple messages in batch
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
          return { ...msg, content: isEncryptedContent(msg.content) ? "[Encryption key unavailable]" : msg.content };
        }

        if (isEncryptedContent(msg.content)) {
          const decrypted = await decryptMessage(msg.content, roomKey);
          return { ...msg, content: decrypted };
        }
        return msg;
      })
    );
  }, [getRoomKey]);

  return {
    e2eReady,
    initEncryption,
    setupRoomEncryption,
    encrypt,
    decrypt,
    decryptMessages,
    getRoomKey,
  };
}
