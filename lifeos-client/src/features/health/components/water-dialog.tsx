'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { healthApiService } from '../services/health.service';
import { WaterUnit } from '@/types/health.types';
import { X, Droplet } from 'lucide-react';

const waterFormSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  unit: z.enum(['ml', 'L']),
});

type WaterFormData = z.infer<typeof waterFormSchema>;

interface WaterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaterDialog({ isOpen, onClose }: WaterDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaterFormData>({
    resolver: zodResolver(waterFormSchema),
    defaultValues: {
      amount: 250,
      unit: 'ml' as WaterUnit,
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: WaterFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      await healthApiService.logWater({
        amount: data.amount,
        unit: data.unit,
      });

      await queryClient.invalidateQueries({ queryKey: ['health-water'] });
      await queryClient.invalidateQueries({ queryKey: ['health-summary'] });
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Failed to log water intake.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-card border-border animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl border p-6 shadow-xl duration-200">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-lg p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Droplet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-foreground text-xl font-semibold">Log Water Intake</h2>
            <p className="text-muted-foreground text-xs">Track hydration towards your daily goal</p>
          </div>
        </div>

        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-xl border p-3 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
              Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                {...register('amount', { valueAsNumber: true })}
                className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
                placeholder="250"
              />
              <select
                {...register('unit')}
                className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary rounded-xl border px-3 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
              >
                <option value="ml">ml</option>
                <option value="L">L</option>
              </select>
            </div>
            {errors.amount && (
              <p className="text-destructive mt-1 text-xs">{errors.amount.message}</p>
            )}
          </div>

          <div className="border-border mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Logging...' : 'Save Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
