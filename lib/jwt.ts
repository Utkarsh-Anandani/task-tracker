import jwt from "jsonwebtoken";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@/types/auth.types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (
  payload: AccessTokenPayload
) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (
  payload: RefreshTokenPayload
) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  return jwt.verify(
    token,
    ACCESS_SECRET
  ) as AccessTokenPayload;
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload => {
  return jwt.verify(
    token,
    REFRESH_SECRET
  ) as RefreshTokenPayload;
};
