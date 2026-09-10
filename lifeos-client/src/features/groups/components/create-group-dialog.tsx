'use client';

import React, { useState } from 'react';
import { ICreateGroupDto, GroupPrivacy } from '@/types/group.types';
import { X, Users, Shield } from 'lucide-react';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateGroupDto) => void;
  isLoading: boolean;
}

export function CreateGroupDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateGroupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('Private');
  const [maxMembers, setMaxMembers] = useState(20);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      privacy,
      maxMembers,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-bold">Create Group</h3>
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
              Group Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Focus & Code 2026"
              className="border-input bg-background text-foreground focus:ring-primary/20 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this accountability group about?"
              className="border-input bg-background text-foreground focus:ring-primary/20 w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Privacy
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as GroupPrivacy)}
                className="border-input bg-background text-foreground focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none focus:ring-2"
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="Invite Only">Invite Only</option>
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Max Members
              </label>
              <input
                type="number"
                min={2}
                max={500}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="border-input bg-background text-foreground focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none focus:ring-2"
              />
            </div>
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
              disabled={isLoading || !name.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-2 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
