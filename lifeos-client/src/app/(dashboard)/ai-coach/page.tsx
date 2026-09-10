'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiApiService } from '@/features/ai/services/ai.service';
import { AISetupCard } from '@/features/ai/components/ai-setup-card';
import { AICoachCard } from '@/features/ai/components/ai-coach-card';
import { Bot } from 'lucide-react';

export default function AICoachPage() {
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: async () => {
      const res = await aiApiService.getSettings();
      return res.data;
    },
  });

  const hasKey = settingsData?.hasKey ?? false;

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <Bot className="h-5 w-5" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">AI Coach & Settings</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Bring Your Own API Key (BYOK) for private, optional AI intelligence. AI remains completely
          optional.
        </p>
      </div>

      {/* BYOK Configuration Card */}
      <AISetupCard settings={settingsData} isLoading={isLoading} />

      {/* Interactive AI Coach Card */}
      <AICoachCard hasKey={hasKey} />
    </div>
  );
}
