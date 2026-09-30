'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmergencyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/focus?mode=emergency');
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-muted-foreground animate-pulse text-xs">
        Redirecting to Focus Mode Crisis Lockdown...
      </div>
    </div>
  );
}
