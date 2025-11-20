import { admin } from "./firebaseAdmin";

export interface CurrentUser {
  uid: string;
  email?: string | null;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentUser(
  authorizationHeader: string | null
): Promise<CurrentUser> {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Invalid authorization header");
  }

  const token = authorizationHeader.split(" ", 2)[1]!.trim();

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email ?? null;

    if (!uid) {
      throw new HttpError(401, "Invalid token payload");
    }

    return { uid, email };
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
