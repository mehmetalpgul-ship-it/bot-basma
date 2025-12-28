# bot-basma

Bu repo, hızlı bir Vite + React uygulaması örneğidir. Özellikler:
- Firebase Auth (Email/Password + Google Sign-In)
- Google reCAPTCHA v3 doğrulama (signup)
- AI içerik üretimi için serverless endpoint (OpenAI) — kullanıcı kimlik doğrulaması gerektirir
- Kullanıcı bazlı 'bot' şablonları (kullanıcı oluşturur)
- AI üretim geçmişi Firestore'a kaydedilir
- Basit rate limit (öntanımlı: 5 istek/dk)

Kurulum
1. Node.js (16+) kurulu olsun.
2. Firebase projesi oluşturun: https://console.firebase.google.com/
   - Authentication > Sign-in method: Email/Password ve Google aktif olsun.
   - Firestore Database oluşturun (test modunda veya uygun rules ile).
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
- RECAPTCHA_SECRET
- OPENAI_API_KEY
- FIREBASE_SERVICE_ACCOUNT (JSON string)
- RATE_LIMIT_PER_MINUTE (opsiyonel, default 5)

Çalıştırma
1. npm install
2. npm run dev
3. http://localhost:5173

Güvenlik notları- OPENAI_API_KEY ve RECAPTCHA_SECRET asla istemci tarafında tutulmamalı. Serverless (Vercel) veya kendi sunucunda env olarak saklayın.
- FIREBASE_SERVICE_ACCOUNT JSON’unu repoya commit etmeyin. (Vercel/Netlify ortam değişkenleri olarak ekleyin.)

Deploy
- Öneri: Vercel. Vercel dashboard’a env değişkenlerini ekleyin: VITE_FIREBASE_..., VITE_RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET, OPENAI_API_KEY, FIREBASE_SERVICE_ACCOUNT, RATE_LIMIT_PER_MINUTE

Notlar
- Bu örnek, temel bir demo amaçlıdır. Üretimde daha sağlam rate limiting, logging, maliyet kontrolü, abuse detection, ve Firestore güvenlik kuralları eklemelisiniz.