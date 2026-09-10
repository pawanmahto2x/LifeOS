'use client';

import React, { useState } from 'react';
import {
  ICreateChallengeDto,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeVisibility,
} from '@/types/challenge.types';
import { X, Trophy } from 'lucide-react';

interface CreateChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateChallengeDto) => void;
  isLoading: boolean;
}

export function CreateChallengeDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateChallengeDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChallengeCategory>('Productivity');
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>('Medium');
  const [visibility, setVisibility] = useState<ChallengeVisibility>('Public');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [reward, setReward] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      visibility,
      startDate,
      endDate,
      reward: reward.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-bold">Create Challenge</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30 Days of Code & Deep Work"
              className="border-input bg-background text-foreground focus:ring-primary/20 w-full rounded-xl border px-3.5 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rules and target goals for this challenge"
              className="border-input bg-background text-foreground focus:ring-primary/20 w-full resize-none rounded-xl border px-3.5 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChallengeCategory)}
                className="border-input bg-background text-foreground w-full rounded-xl border px-2.5 py-1.5 text-xs font-semibold outline-none"
              >
                <option value="Productivity">Productivity</option>
                <option value="Fitness">Fitness</option>
                <option value="Learning">Learning</option>
                <option value="Mindfulness">Mindfulness</option>
                <option value="Health">Health</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty)}
                className="border-input bg-background text-foreground w-full rounded-xl border px-2.5 py-1.5 text-xs font-semibold outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ChallengeVisibility)}
                className="border-input bg-background text-foreground w-full rounded-xl border px-2.5 py-1.5 text-xs font-semibold outline-none"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Friends">Friends</option>
                <option value="Group">Group</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-input bg-background text-foreground w-full rounded-xl border px-3 py-1.5 text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-input bg-background text-foreground w-full rounded-xl border px-3 py-1.5 text-xs font-medium outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Badge / Reward (Optional)
            </label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="e.g. Master Builder Badge"
              className="border-input bg-background text-foreground focus:ring-primary/20 w-full rounded-xl border px-3.5 py-2 text-sm outline-none focus:ring-2"
            />
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
              disabled={isLoading || !title.trim() || !description.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-2 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
