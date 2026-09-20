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
    Low: 'border-border bg-muted text-muted-foreground',
    Medium: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    High: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Urgent: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="group border-border/80 bg-card hover:border-primary/40 flex items-start justify-between rounded-2xl border p-4 transition-all duration-200 hover:shadow-xs">
      <div className="flex min-w-0 flex-1 items-start space-x-3.5">
        <button
          onClick={() => onToggleComplete(task)}
          className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 cursor-pointer transition-colors"
          aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="hover:text-primary h-5 w-5 transition-colors" />
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={`truncate text-sm font-semibold tracking-tight transition-all ${
              isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
            }`}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="text-muted-foreground line-clamp-2 text-xs">{task.description}</p>
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
              <span className="border-border/80 bg-muted/60 text-foreground rounded-md border px-2 py-0.5 text-[10px] font-medium">
                {task.category}
              </span>
            )}

            {formattedDueDate && (
              <span className="text-muted-foreground flex items-center space-x-1 text-[10px]">
                <Calendar className="h-3 w-3" />
                <span>{formattedDueDate}</span>
              </span>
            )}

            {isCompleted && task.completedAt && (
              <span className="flex items-center space-x-1 text-[10px] font-medium text-emerald-500">
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
          className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
          title="Edit task"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg p-1.5 transition-colors"
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
