'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApiService } from '@/features/tasks/services/task.service';
import { TaskItem } from '@/features/tasks/components/task-item';
import { TaskDialog } from '@/features/tasks/components/task-dialog';
import { ITask } from '@/types/task.types';
import { Plus, Search, CheckSquare, X, ListFilter } from 'lucide-react';

function TasksContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  // Fetch tasks query
  const { data, isLoading } = useQuery({
    queryKey: ['tasks', selectedStatus, searchQuery],
    queryFn: async () => {
      const params: Parameters<typeof taskApiService.getTasks>[0] = {};
      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const response = await taskApiService.getTasks(params);
      return response.data;
    },
  });

  const tasks = data?.tasks || [];

  // Toggle complete mutation
  const completeMutation = useMutation({
    mutationFn: async (task: ITask) => {
      if (task.status === 'Completed') {
        return taskApiService.updateTask(task._id, { status: 'Pending' });
      }
      return taskApiService.completeTask(task._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.refetchQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (task: ITask) => {
      return taskApiService.deleteTask(task._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.refetchQueries({ queryKey: ['tasks'] });
    },
  });

  const handleEdit = (task: ITask) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setTaskToEdit(null);
    setIsDialogOpen(true);
  };

  const statusTabs = ['All', 'Pending', 'Completed'];

  const priorityWeight: Record<string, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Completed tasks go to the bottom
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;

    // 2. Sort by Priority (Descending)
    const weightA = priorityWeight[a.priority] || 0;
    const weightB = priorityWeight[b.priority] || 0;
    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // 3. Sort by Due Date (Ascending - nearest deadline first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // 4. Fallback to CreatedAt (Descending)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Capture, organize, and execute your daily priorities with precision.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="border-border/80 bg-card flex flex-col gap-3 rounded-2xl border p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex scrollbar-none items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <ListFilter className="text-muted-foreground mr-1.5 hidden h-3.5 w-3.5 shrink-0 sm:inline" />
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                selectedStatus === status
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-input bg-background/80 text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 w-full rounded-xl border py-1.5 pr-8 pl-9 text-xs transition-colors focus:ring-2 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-muted-foreground hover:text-foreground absolute top-2 right-2.5 rounded p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Task List or Empty State */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-border/80 bg-card h-20 animate-pulse rounded-2xl border"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="border-border/80 bg-card/60 rounded-2xl border border-dashed p-12 text-center shadow-2xs">
          <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <CheckSquare className="h-6 w-6" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">No tasks found</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
            {searchQuery || selectedStatus !== 'All'
              ? 'No tasks match your active filter criteria. Try resetting your search or filter tab.'
              : 'You have no tasks created yet. Click "New Task" to capture your first goal.'}
          </p>
          <div className="mt-5">
            <button
              onClick={handleCreate}
              className="border-border bg-muted/80 text-foreground hover:bg-muted inline-flex cursor-pointer items-center space-x-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create your first task</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggleComplete={(t) => completeMutation.mutate(t)}
              onEdit={handleEdit}
              onDelete={(t) => deleteMutation.mutate(t)}
            />
          ))}
        </div>
      )}

      {/* Task Create / Edit Dialog Modal */}
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
          Loading tasks...
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}
