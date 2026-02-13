import { NextRequest } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify(swaggerSpec), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
