'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApiService } from '@/features/tasks/services/task.service';
import { TaskItem } from '@/features/tasks/components/task-item';
import { TaskDialog } from '@/features/tasks/components/task-dialog';
import { ITask } from '@/types/task.types';
import { Plus, Search, CheckSquare } from 'lucide-react';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);

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
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (task: ITask) => {
      return taskApiService.deleteTask(task._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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

  const statusTabs = ['All', 'Pending', 'In Progress', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Tasks</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Capture, organize, and execute your daily priorities.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center space-x-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-neutral-950 shadow transition-colors hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 border-b border-neutral-800 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex scrollbar-none items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-neutral-800 font-semibold text-white'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 py-1.5 pr-3 pl-9 text-xs text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Task List or Empty State */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/30"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/10 p-12 text-center">
          <CheckSquare className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-200">No tasks found</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
            {searchQuery || selectedStatus !== 'All'
              ? 'No tasks match your filter criteria. Try clearing the filter or search.'
              : 'You have no tasks created yet. Click "New Task" to create your first action item.'}
          </p>
          <div className="mt-5">
            <button
              onClick={handleCreate}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create your first task</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
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
