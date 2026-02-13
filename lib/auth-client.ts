"use client";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";


// Store tokens
export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    tokens.accessToken
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    tokens.refreshToken
  );
}


// Get tokens
export function getAccessToken(): string | null {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}


// Clear tokens
export function clearTokens(): void {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );
}


// Refresh access token
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken =
      getRefreshToken();

    if (!refreshToken)
      return null;

    const res = await fetch(
      "/api/v1/auth/refresh",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    if (!res.ok)
      throw new Error();

    const data: AuthTokens =
      await res.json();

    setTokens(data);

    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}
