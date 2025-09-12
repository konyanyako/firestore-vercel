const admin = require('firebase-admin');
const getRawBody = require('raw-body');

console.log("🔥 index.js 実行開始");

if (!admin.apps.length) {
  console.log("🛠 Firebase初期化開始");
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
  console.log("✅ Firebase初期化完了");
}

const db = admin.firestore();

module.exports = async (req, res) => {
  console.log("📦 リクエストメソッド:", req.method);
  console.log("📍 クエリパラメータ:", req.query);

  const placeName = req.query.name || '多摩川の里';
  const docRef = db.collection('places').doc(placeName);

  if (req.method === 'POST') {
    console.log("🔥 POST処理の入り口に到達");

    try {
      console.log("📥 POST処理 tryブロック開始");

      const rawBody = await getRawBody(req);
      console.log("📦 rawBody取得成功");

      const body = JSON.parse(rawBody.toString());
      console.log("📨 受信したPOSTデータ:", body);

      const { currentRound, currentMatch } = body;
      console.log("🧪 currentRound:", currentRound);
      console.log("🧪 currentMatch:", currentMatch);

      await docRef.set({ currentRound, currentMatch }, { merge: true });
      console.log("✅ Firestore更新成功");

      res.setHeader('Cache-Control', 'no-store'); // キャッシュ防止
      return res.status(200).json({
        message: '更新成功',
        received: body,
        place: placeName
      });
    } catch (error) {
      console.error("❌ POST処理エラー:", error.message);
      console.error("🧵 エラースタック:", error.stack);
      return res.status(500).json({ error: '更新失敗', details: error.message });
    }
  }

  // GET処理
  try {
    console.log("📥 GET処理開始");

    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      console.warn("⚠️ ドキュメントが存在しません:", placeName);
      return res.status(404).json({ error: 'ドキュメントが存在しません' });
    }

    console.log("📤 GET処理成功");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store'); // キャッシュ防止
    res.status(200).json(docSnap.data());
  } catch (error) {
    console.error("❌ GET処理エラー:", error.message);
    console.error("🧵 エラースタック:", error.stack);
    res.status(500).json({ error: '取得エラー', details: error.message });
  }
};
