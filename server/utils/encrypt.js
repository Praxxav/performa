// Description: This file contains functions to encrypt and decrypt data using AES-256-CBC algorithm.


import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ALGO = 'aes-256-cbc';


const KEY = Buffer.from(process.env.ENCRYPTION_SECRET.trim(), 'hex');


export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  // Use binary encoding throughout
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);
  return Buffer.concat([iv, encrypted]).toString('base64');
}

export function decrypt(encryptedB64) {
  const buffer = Buffer.from(encryptedB64, 'base64');
  const iv = buffer.subarray(0, 16);
  const ciphertext = buffer.subarray(16);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  // Directly process binary data
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8');
}


