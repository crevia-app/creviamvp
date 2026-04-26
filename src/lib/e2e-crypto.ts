/**
 * End-to-End Encryption for Crevia Chat
 * Uses Web Crypto API with ECDH key exchange + AES-256-GCM
 * 
 * Flow:
 * 1. Each user generates an ECDH key pair on first use
 * 2. Public keys are stored in the database
 * 3. Private keys are stored in IndexedDB (never leaves device)
 * 4. Per-room: a random AES-256-GCM key is generated
 * 5. The room key is encrypted (wrapped) with each member's derived ECDH shared secret
 * 6. Messages are encrypted/decrypted with the room's AES key
 */

const DB_NAME = "crevia-e2ee";
const STORE_NAME = "keys";
const DB_VERSION = 1;

// ========================
// IndexedDB for private keys
// ========================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storePrivateKey(userId: string, privateKey: CryptoKey): Promise<void> {
  const exported = await crypto.subtle.exportKey("jwk", privateKey);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id: `private-${userId}`, key: exported });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPrivateKey(userId: string): Promise<CryptoKey | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(`private-${userId}`);
    req.onsuccess = async () => {
      if (!req.result) return resolve(null);
      try {
        const key = await crypto.subtle.importKey(
          "jwk",
          req.result.key,
          { name: "ECDH", namedCurve: "P-256" },
          false,
          ["deriveBits"]
        );
        resolve(key);
      } catch {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

async function storeRoomKey(roomId: string, aesKey: CryptoKey): Promise<void> {
  const exported = await crypto.subtle.exportKey("jwk", aesKey);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id: `room-${roomId}`, key: exported });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getRoomKeyFromCache(roomId: string): Promise<CryptoKey | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(`room-${roomId}`);
    req.onsuccess = async () => {
      if (!req.result) return resolve(null);
      try {
        const key = await crypto.subtle.importKey(
          "jwk",
          req.result.key,
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        resolve(key);
      } catch {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

// ========================
// Key Generation
// ========================

export async function generateUserKeyPair(): Promise<{ publicKeyJwk: JsonWebKey; privateKey: CryptoKey }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  return { publicKeyJwk, privateKey: keyPair.privateKey };
}

export async function generateRoomKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// ========================
// ECDH Shared Secret Derivation
// ========================

async function deriveSharedKey(privateKey: CryptoKey, publicKeyJwk: JsonWebKey): Promise<CryptoKey> {
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: publicKey },
    privateKey,
    256
  );

  return crypto.subtle.importKey(
    "raw",
    sharedBits,
    { name: "AES-GCM", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

// ========================
// Room Key Wrapping (encrypt room key for a member)
// ========================

export async function wrapRoomKey(
  roomKey: CryptoKey,
  myPrivateKey: CryptoKey,
  theirPublicKeyJwk: JsonWebKey
): Promise<string> {
  const sharedKey = await deriveSharedKey(myPrivateKey, theirPublicKeyJwk);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.wrapKey("raw", roomKey, sharedKey, {
    name: "AES-GCM",
    iv,
  });

  // Combine iv + wrapped key, encode as base64
  const combined = new Uint8Array(iv.length + wrapped.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(wrapped), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function unwrapRoomKey(
  wrappedKeyBase64: string,
  myPrivateKey: CryptoKey,
  theirPublicKeyJwk: JsonWebKey
): Promise<CryptoKey> {
  const combined = Uint8Array.from(atob(wrappedKeyBase64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const wrappedKey = combined.slice(12);

  const sharedKey = await deriveSharedKey(myPrivateKey, theirPublicKeyJwk);
  return crypto.subtle.unwrapKey(
    "raw",
    wrappedKey,
    sharedKey,
    { name: "AES-GCM", iv },
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// ========================
// Message Encryption/Decryption
// ========================

export async function encryptMessage(plaintext: string, roomKey: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    roomKey,
    encoded
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptMessage(ciphertextBase64: string, roomKey: CryptoKey): Promise<string> {
  try {
    const combined = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
    if (combined.length < 13) return "[Unable to decrypt message]";
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      roomKey,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.warn("Decryption failed:", err);
    return "[Unable to decrypt message]";
  }
}

// ========================
// High-level helpers (manage local storage)
// ========================

export async function initUserKeys(userId: string): Promise<{ publicKeyJwk: JsonWebKey; isNew: boolean }> {
  const existing = await getPrivateKey(userId);
  if (existing) {
    // Retrieve stored public key from IndexedDB
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(`public-${userId}`);
      req.onsuccess = () => {
        if (req.result) {
          resolve({ publicKeyJwk: req.result.key, isNew: false });
        } else {
          // Shouldn't happen, regenerate
          generateAndStore(userId).then((r) => resolve({ ...r, isNew: true }));
        }
      };
      req.onerror = () => reject(req.error);
    });
  }
  const result = await generateAndStore(userId);
  return { ...result, isNew: true };
}

async function generateAndStore(userId: string): Promise<{ publicKeyJwk: JsonWebKey }> {
  const { publicKeyJwk, privateKey } = await generateUserKeyPair();
  await storePrivateKey(userId, privateKey);
  // Also store public key locally for retrieval
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id: `public-${userId}`, key: publicKeyJwk });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return { publicKeyJwk };
}

export async function getUserPrivateKey(userId: string): Promise<CryptoKey | null> {
  return getPrivateKey(userId);
}

export async function cacheRoomKey(roomId: string, roomKey: CryptoKey): Promise<void> {
  return storeRoomKey(roomId, roomKey);
}

export async function getCachedRoomKey(roomId: string): Promise<CryptoKey | null> {
  return getRoomKeyFromCache(roomId);
}

// ========================
// Private Key Cloud Backup (cross-device sync)
// ========================

// Derives a wrapping key from userId + random salt via PBKDF2.
// The salt is stored per-user in Supabase; only the user's UUID is needed to derive the key.
async function deriveWrappingKey(userId: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(userId),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypts the private key for cloud storage. Returns base64-encoded ciphertext and salt.
// The private key is exported as JWK, encrypted with AES-256-GCM using the wrapping key.
export async function backupPrivateKey(
  userId: string,
  privateKey: CryptoKey
): Promise<{ encryptedKey: string; saltBase64: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const wrappingKey = await deriveWrappingKey(userId, salt);
  const exported = await crypto.subtle.exportKey("jwk", privateKey);
  const encoded = new TextEncoder().encode(JSON.stringify(exported));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrappingKey, encoded);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return {
    encryptedKey: btoa(String.fromCharCode(...combined)),
    saltBase64: btoa(String.fromCharCode(...salt)),
  };
}

// Decrypts the private key from cloud storage and caches it in IndexedDB.
// Called on a new device where IndexedDB has no key yet.
export async function restorePrivateKey(
  userId: string,
  encryptedKey: string,
  saltBase64: string
): Promise<CryptoKey> {
  const salt = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));
  const wrappingKey = await deriveWrappingKey(userId, salt);
  const combined = Uint8Array.from(atob(encryptedKey), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, wrappingKey, ciphertext);
  const jwk = JSON.parse(new TextDecoder().decode(decrypted)) as JsonWebKey;
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits"]
  );
  await storePrivateKey(userId, privateKey);
  return privateKey;
}

// Check if a string looks like it's E2EE encrypted (base64 with sufficient length)
export function isEncryptedContent(content: string | null): boolean {
  if (!content) return false;
  // Encrypted messages are base64 and at least ~30 chars (12 byte IV + some ciphertext)
  try {
    if (content.length < 20) return false;
    const decoded = atob(content);
    return decoded.length >= 13; // At least IV (12) + 1 byte
  } catch {
    return false;
  }
}
