'use client';

import React, { useState } from 'react';
import { X, KeyRound } from 'lucide-react';

interface JoinGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  isLoading: boolean;
}

export function JoinGroupDialog({ isOpen, onClose, onSubmit, isLoading }: JoinGroupDialogProps) {
  const [inviteCode, setInviteCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    onSubmit(inviteCode.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border bg-card w-full max-w-sm rounded-2xl border p-6 shadow-2xl">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-bold">Join Group</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Invite Code *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. 9F8A2B1C"
              className="border-input bg-background text-foreground focus:ring-primary/20 w-full rounded-xl border px-3.5 py-2.5 text-center font-mono text-sm tracking-widest uppercase outline-none focus:ring-2"
              maxLength={12}
            />
            <p className="text-muted-foreground mt-1 text-[11px]">
              Ask the group owner or an admin for their 8-character invite code.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl border px-4 py-2 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-2 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
