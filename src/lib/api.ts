// src/lib/api.ts
import axios from 'axios';

// 一時的にAPI BASE URLを直接記述
// IMPORTANT: This is for temporary testing only.
// In a production environment, this value should always come from environment variables.
const API_BASE_URL = 'https://app-step4-29.azurewebsites.net'; 

// デバッグ用にログを出力する (今回は undefined ではないことを確認できるはず)
console.log('API BASE URL (hardcoded):', API_BASE_URL);

if (!API_BASE_URL) {
  // 通常はここでエラーをスローしますが、今回はハードコードしているので到達しないはず
  // 万一の場合のために残しておきます
  throw new Error('API BASE URL is not defined (even hardcoded!).');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  // その他の設定（例: timeout, headersなど）
});

export default api;

