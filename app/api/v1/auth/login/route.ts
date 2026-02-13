/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return tokens
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       description: User login credentials
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */

import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/schemas/auth.schema";
import { loginUser } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validated = loginSchema.parse(body);

    const result = await loginUser(
      validated.email,
      validated.password
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 401 }
    );
  }
}
