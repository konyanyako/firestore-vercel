// index.js
const admin = require('firebase-admin');
const getRawBody = require('raw-body');

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
  console.log("🔥 リクエストメソッド:", req.method); // ← 目立つログに変更

  const placeName = req.query.name || '多摩川の里';
  const docRef = db.collection('places').doc(placeName);

  if (req.method === 'POST') {
    console.log("✅ POST処理に入りました");

    try {
      const rawBody = await getRawBody(req);
      console.log("📦 rawBody取得成功");

      const body = JSON.parse(rawBody.toString());
      console.log("📨 受信したPOSTデータ:", body);

      const { currentRound, currentMatch } = body;

      await docRef.set({ currentRound, currentMatch }, { merge: true });
      console.log("✅ Firestore更新成功");

      return res.status(200).json({ message: '更新成功' });
    } catch (error) {
      console.error("❌ POST処理エラー:", error.message);
      return res.status(500).json({ error: '更新失敗', details: error.message });
    }
  }

  // GET処理
  try {
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'ドキュメントが存在しません' });
    }

    console.log("📤 GET処理成功");
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(docSnap.data());
  } catch (error) {
    console.error("❌ GET処理エラー:", error.message);
    res.status(500).json({ error: '取得エラー', details: error.message });
  }
};
