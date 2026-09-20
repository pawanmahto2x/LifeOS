'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { taskApiService } from '../services/task.service';
import { ITask, TaskPriority, TaskStatus } from '@/types/task.types';
import { X } from 'lucide-react';

const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  dueDate: z.string().optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Archived']).optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ITask | null;
}

export function TaskDialog({ isOpen, onClose, taskToEdit }: TaskDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    values: taskToEdit
      ? {
          title: taskToEdit.title,
          description: taskToEdit.description || '',
          category: taskToEdit.category || 'General',
          priority: taskToEdit.priority,
          dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
          status: taskToEdit.status,
        }
      : {
          title: '',
          description: '',
          category: 'General',
          priority: 'Medium',
          dueDate: '',
          status: 'Pending',
        },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const payload = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        category: data.category?.trim() || 'General',
        priority: data.priority as TaskPriority,
        dueDate: data.dueDate?.trim() ? new Date(data.dueDate).toISOString() : undefined,
        status: (data.status || 'Pending') as TaskStatus,
      };

      if (taskToEdit) {
        await taskApiService.updateTask(taskToEdit._id, payload);
      } else {
        await taskApiService.createTask(payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.refetchQueries({ queryKey: ['tasks'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Failed to save task.');
      } else {
        setServerError('An unexpected error occurred. Please check that the server is active.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border/80 bg-card text-card-foreground relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all">
        <div className="border-border/80 flex items-center justify-between border-b pb-4">
          <h2 className="text-foreground text-base font-bold">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {serverError && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive mt-4 rounded-xl border p-3 text-xs">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Complete quarterly review"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
            {errors.title && (
              <p className="text-destructive mt-1 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Add key details or checklists..."
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full resize-none rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                Priority
              </label>
              <select
                {...register('priority')}
                className="border-input bg-background text-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                Category
              </label>
              <input
                type="text"
                {...register('category')}
                placeholder="e.g. Work, Personal"
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="border-input bg-background text-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="border-border/80 flex items-center justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-xl px-4 py-2 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
