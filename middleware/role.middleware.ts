import { AccessTokenPayload } from "@/types/auth.types";

export function authorize(
  user: AccessTokenPayload,
  allowedRoles: ("USER" | "ADMIN")[]
) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
}
