/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       description: User registration details
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/schemas/auth.schema";
import { registerUser } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validated = registerSchema.parse(body);

    const user = await registerUser(validated);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    );
  }
}
