// index.js
const admin = require('firebase-admin');

// Firebase Admin SDK の初期化（初回のみ）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  const placeName = req.query.name || '多摩川の里';

  // Alexaからのアクセスかどうかを確認するためのログ
  console.log('User-Agent:', req.headers['user-agent']);

  try {
    const docRef = db.collection('places').doc(placeName);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'ドキュメントが存在しません' });
    }

    res.setHeader('Content-Type', 'application/json'); // ← これを追加
    res.status(200).json(docSnap.data());
  } catch (error) {
    res.status(500).json({ error: 'エラーが発生しました', details: error.message });
  }
};
