import { verifyAccessToken } from "@/lib/jwt";
import { AccessTokenPayload } from "@/types/auth.types";

export function authenticate(
  req: Request
): AccessTokenPayload {
  const authHeader = req.headers.get("authorization");

  if (!authHeader)
    throw new Error("Authorization header missing");

  if (!authHeader.startsWith("Bearer "))
    throw new Error("Invalid authorization format");

  const token = authHeader.split(" ")[1];

  return verifyAccessToken(token);
}
