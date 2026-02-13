import { hashPassword, comparePassword } from "@/lib/bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export const registerUser = async (data: any) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) throw new Error("User already exists");

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashed,
    },
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);

  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
