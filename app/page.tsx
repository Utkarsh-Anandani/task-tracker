'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // useEffect(() => {
  //   if (!loading) {
  //     if (user) {
  //       router.push('/tasks');
  //     } else {
  //       router.push('/login');
  //     }
  //   }
  // }, [user, loading, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
}
