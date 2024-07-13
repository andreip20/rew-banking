import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY_FOR_ENCRYPTION;
const FIXED_IV = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");

export function encrypt(text) {
  const ciphertext = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Hex.parse(SECRET_KEY),
    { iv: FIXED_IV }
  ).toString();
  return ciphertext;
}

export function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(
    ciphertext,
    CryptoJS.enc.Hex.parse(SECRET_KEY),
    { iv: FIXED_IV }
  );
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}
