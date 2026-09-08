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
        title: data.title,
        description: data.description || undefined,
        category: data.category || 'General',
        priority: data.priority as TaskPriority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        status: (data.status || 'Pending') as TaskStatus,
      };

      if (taskToEdit) {
        await taskApiService.updateTask(taskToEdit._id, payload);
      } else {
        await taskApiService.createTask(payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Failed to save task.');
      } else {
        setServerError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-lg font-bold text-white">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-950/60 p-3 text-xs text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Complete quarterly review"
              className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Add key details or checklists..."
              className="mt-1 block w-full resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
                Priority
              </label>
              <select
                {...register('priority')}
                className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-neutral-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
                Category
              </label>
              <input
                type="text"
                {...register('category')}
                placeholder="e.g. Work, Personal"
                className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
