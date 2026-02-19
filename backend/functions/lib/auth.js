import { adminAuth } from "./firebaseAdmin.js";

function unauthorized(message = "Unauthorized") {
  const err = new Error(message);
  err.statusCode = 401;
  return err;
}

function forbidden(message = "Forbidden") {
  const err = new Error(message);
  err.statusCode = 403;
  return err;
}

export async function requireAdminUser(req) {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.startsWith("Bearer ")) {
    throw unauthorized("Missing Bearer token");
  }

  const token = authHeader.slice(7).trim();
  if (!token) throw unauthorized("Invalid token");

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    throw unauthorized("Token verification failed");
  }

  if (!decoded?.admin) {
    throw forbidden("Admin role required");
  }

  return decoded;
}
