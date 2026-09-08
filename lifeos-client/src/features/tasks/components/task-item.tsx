'use client';

import React from 'react';
import { ITask } from '@/types/task.types';
import { CheckCircle2, Circle, Clock, Trash2, Edit2, Calendar } from 'lucide-react';

interface TaskItemProps {
  task: ITask;
  onToggleComplete: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'Completed';

  const priorityColors = {
    Low: 'bg-neutral-800 text-neutral-400 border-neutral-700',
    Medium: 'bg-blue-950/40 text-blue-400 border-blue-800',
    High: 'bg-amber-950/40 text-amber-400 border-amber-800',
    Urgent: 'bg-red-950/40 text-red-400 border-red-800',
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="group flex items-start justify-between rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/80">
      <div className="flex min-w-0 flex-1 items-start space-x-3.5">
        <button
          onClick={() => onToggleComplete(task)}
          className="mt-0.5 shrink-0 text-neutral-500 transition-colors hover:text-white"
          aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={`truncate text-sm font-medium tracking-tight ${
              isCompleted ? 'text-neutral-500 line-through' : 'text-white'
            }`}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="line-clamp-2 text-xs text-neutral-400">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                priorityColors[task.priority] || priorityColors.Medium
              }`}
            >
              {task.priority}
            </span>

            {task.category && (
              <span className="rounded-md border border-neutral-800 bg-neutral-800/80 px-2 py-0.5 text-[10px] font-medium text-neutral-300">
                {task.category}
              </span>
            )}

            {formattedDueDate && (
              <span className="flex items-center space-x-1 text-[10px] text-neutral-400">
                <Calendar className="h-3 w-3" />
                <span>{formattedDueDate}</span>
              </span>
            )}

            {isCompleted && task.completedAt && (
              <span className="flex items-center space-x-1 text-[10px] text-emerald-400">
                <Clock className="h-3 w-3" />
                <span>Completed</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ml-2 flex shrink-0 items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(task)}
          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          title="Edit task"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
