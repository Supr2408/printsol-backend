import admin from "firebase-admin";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment");
}

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export { admin };
