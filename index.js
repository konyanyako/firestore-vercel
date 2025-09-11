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
  const docRef = db.collection('places').doc(placeName);

  if (req.method === 'POST') {
    try {
      const { currentRound, currentMatch } = req.body;

      await docRef.update({
        currentRound,
        currentMatch
      });

      return res.status(200).json({ message: '更新成功' });
    } catch (error) {
      return res.status(500).json({ error: '更新失敗', details: error.message });
    }
  }

  // GET処理（既存の読み取り）
  try {
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'ドキュメントが存在しません' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(docSnap.data());
  } catch (error) {
    res.status(500).json({ error: '取得エラー', details: error.message });
  }
};

