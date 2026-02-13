export interface AccessTokenPayload {
  userId: string;
  role: "USER" | "ADMIN";
  name: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}
