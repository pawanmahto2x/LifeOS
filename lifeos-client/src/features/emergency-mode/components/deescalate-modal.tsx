'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DeescalateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeescalateModal({ isOpen, onClose, onConfirm, isLoading }: DeescalateModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_PHRASE = 'RESTORE';

  if (!isOpen) return null;

  const isConfirmValid = confirmText.trim().toUpperCase() === CONFIRM_PHRASE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl border border-rose-500/30 p-6 shadow-2xl">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-bold">De-escalate Emergency Mode?</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="text-xs leading-relaxed text-amber-600 dark:text-amber-300">
                Disabling Emergency Mode will <strong>restore</strong> your original Focus Lock,
                screen time goals, and notification preferences from before activation. Make sure
                your situation is actually resolved before de-escalating.
              </div>
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
              Type <span className="font-bold text-rose-500">RESTORE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESTORE"
              className="border-border bg-background text-foreground placeholder-muted-foreground w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
          >
            Stay in Emergency Mode
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmValid || isLoading}
            className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? 'Restoring...' : 'Restore Normal Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
