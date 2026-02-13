'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens, getAccessToken } from '@/lib/auth-client';
import { parseJwt } from './tasks/page';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
      const token = getAccessToken();
  
      if (!token) {
        router.push("/login");
        return;
      }
  
      const parsedUser = parseJwt(token);
  
      if (!parsedUser) {
        clearTokens();
        router.push("/login");
        return;
      }

      router.push("/tasks");
    }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
}
