# bot-basma

Bu repo, hızlı bir Vite + React uygulaması örneğidir. Özellikler:
- Firebase Auth (Email/Password + Google Sign-In)
- Google reCAPTCHA v3 doğrulama (signup)
- AI içerik üretimi için serverless endpoint (OpenAI) — kullanıcı kimlik doğrulaması gerektirir

Kurulum
1. Node.js (16+) kurulu olsun.
2. Firebase projesi oluşturun: https://console.firebase.google.com/
   - Authentication > Sign-in method: Email/Password ve Google aktif olsun.
   - Proje ayarlarından Web uygulama ekleyin ve config değerlerini alın.
   - Service Account (IAM & Admin > Service Accounts) oluşturup JSON anahtarını alın. Bu JSON içeriğini Vercel veya hosting env olarak ekleyeceksiniz.
3. OpenAI API anahtarınızı alın (https://platform.openai.com/account/api-keys).
4. Google reCAPTCHA v3 oluşturun, site key ve secret alın.

Env (örnek .env.example):
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_RECAPTCHA_SITE_KEY
- OPENAI_API_KEY
- FIREBASE_SERVICE_ACCOUNT (JSON string, dikkat gizli)
- RECAPTCHA_SECRET

Çalıştırma
1. npm install
2. npm run dev
3. http://localhost:5173

Deploy
- Öneri: Vercel. Çevresel değişkenleri Vercel dashboard'una ekleyin.
