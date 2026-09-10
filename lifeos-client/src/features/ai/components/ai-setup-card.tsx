'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApiService } from '../services/ai.service';
import { IAISettings, AIProvider } from '@/types/ai.types';
import { KeyRound, Shield, Check, Trash2 } from 'lucide-react';

interface AISetupCardProps {
  settings?: IAISettings;
  isLoading: boolean;
}

const PROVIDERS: { id: AIProvider; label: string; defaultModel: string; placeholder: string }[] = [
  {
    id: 'gemini',
    label: 'Google Gemini',
    defaultModel: 'gemini-2.5-pro',
    placeholder: 'AIzaSy...',
  },
  { id: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o', placeholder: 'sk-...' },
  {
    id: 'claude',
    label: 'Anthropic Claude',
    defaultModel: 'claude-3-5-sonnet',
    placeholder: 'sk-ant-...',
  },
  { id: 'groq', label: 'Groq', defaultModel: 'llama-3.3-70b-versatile', placeholder: 'gsk_...' },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    placeholder: 'sk-or-...',
  },
];

export function AISetupCard({ settings, isLoading }: AISetupCardProps) {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-pro');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () => aiApiService.saveSettings({ provider, apiKey, model, isEnabled: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      setApiKey('');
      setSuccessMsg('API Key saved and encrypted securely.');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => aiApiService.deleteSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      setSuccessMsg('API key removed. AI features are now disabled.');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    const p = PROVIDERS.find((x) => x.id === newProvider);
    if (p) setModel(p.defaultModel);
  };

  if (isLoading) {
    return <div className="border-border bg-card h-48 animate-pulse rounded-2xl border" />;
  }

  const hasKey = settings?.hasKey ?? false;

  return (
    <div className="border-border bg-card space-y-4 rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
              Bring Your Own Key (BYOK)
            </h2>
            <p className="text-muted-foreground text-xs">
              Keys are encrypted client-side and server-side with AES-256-GCM. Plain-text keys are
              never stored.
            </p>
          </div>
        </div>

        {hasKey && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <Shield className="h-3 w-3" /> Active ({settings?.provider})
            </span>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="border-border text-muted-foreground rounded-lg border p-1.5 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
              title="Remove Key"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-3.5"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="border-input bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Model
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="border-input bg-background text-foreground w-full rounded-xl border px-3 py-2 font-mono text-xs outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
            API Key
          </label>
          <input
            type="password"
            required
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              hasKey
                ? '•••••••••••••••••••• (Leave blank to keep current key, or enter new key to replace)'
                : 'Enter your API key...'
            }
            className="border-input bg-background text-foreground w-full rounded-xl border px-3.5 py-2 font-mono text-xs outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending || !apiKey.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-2 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending
              ? 'Saving & Encrypting...'
              : hasKey
                ? 'Update API Key'
                : 'Save & Enable AI'}
          </button>
        </div>
      </form>
    </div>
  );
}
