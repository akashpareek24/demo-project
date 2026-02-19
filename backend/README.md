# Global Wire Backend (Firebase Functions + Firestore)

Ye backend aapke frontend se alag hai. Existing frontend API flow ko change nahi kiya gaya.

## Kya bana hai

- Public endpoints:
  - `GET /health`
  - `GET /news?category=top&page=1&limit=12`
  - `GET /news/:id`
  - `GET /search?q=...&category=all&page=1&limit=25`
- Admin endpoints (Firebase ID token + `admin` claim required):
  - `POST /admin/news`
  - `PATCH /admin/news/:id`
  - `DELETE /admin/news/:id`

## Folder

- `backend/functions/index.js`: API routes
- `backend/functions/lib/firebaseAdmin.js`: admin SDK init
- `backend/functions/lib/auth.js`: admin auth guard
- `backend/firestore.rules`
- `backend/firestore.indexes.json`
- `backend/firebase.json`

## Setup

1. Firebase CLI install:
   - `npm i -g firebase-tools`
2. Login:
   - `firebase login`
3. `backend` folder me jao:
   - `cd backend`
4. Project select/init:
   - `firebase use --add`
5. Functions deps install:
   - `cd functions`
   - `npm install`
6. Emulator run:
   - `npm run serve`

## Deploy

`backend/functions` se:
- `npm run deploy`

## Admin access

Admin endpoints chalane ke liye user ke custom claims me `admin: true` hona chahiye.

Example (trusted server/one-time script):

```js
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

Phir frontend/app se Firebase ID token lekar request bhejo:

```http
Authorization: Bearer <firebase_id_token>
```

## Article payload (POST/PATCH)

```json
{
  "category": "world",
  "title": "Sample story",
  "summary": "Short summary",
  "content": ["para1", "para2"],
  "author": "News Desk",
  "region": "World",
  "tag": "WORLD",
  "readTime": "5 min read",
  "date": "2026-02-18",
  "url": "https://example.com/story",
  "image": {
    "src": "https://example.com/image.jpg",
    "alt": "story image"
  },
  "status": "published"
}
```
