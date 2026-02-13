/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Generate new access token using refresh token
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       description: Refresh token
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your_refresh_token
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid refresh token
 */

import { NextRequest, NextResponse } from "next/server";

import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const refreshToken = body.refreshToken;

    if (!refreshToken) throw new Error("Refresh token required");

    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error("User not found!!");
    }

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      role: user?.role || "USER",
      name: user.name,
      email: user.email,
    });

    return NextResponse.json({
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
