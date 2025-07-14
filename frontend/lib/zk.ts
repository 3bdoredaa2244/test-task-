import { sha256 } from "@noble/hashes/sha256";
import { utf8 } from "@noble/hashes/utils";

/**
 * Create a zk-commitment hash for escrow fulfillment
 * @param metadata - stringified metadata (link, title, description, etc)
 * @returns Uint8Array (32 bytes)
 */
export function createZkCommitment(metadata: Record<string, any>): Uint8Array {
  const json = JSON.stringify(metadata);
  const hash = sha256(utf8.encode(json));
  return new Uint8Array(hash); // Length: 32
}
