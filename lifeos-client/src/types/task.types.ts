export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Archived';

export interface ITask {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority: TaskPriority;
  dueDate?: string;
  reminder?: string;
  status: TaskStatus;
  completedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTaskPayload {
  title: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  dueDate?: string;
  reminder?: string;
}

export interface IUpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  dueDate?: string;
  reminder?: string;
  status?: TaskStatus;
}

export interface ITasksListResponse {
  tasks: ITask[];
  total: number;
  page: number;
  totalPages: number;
}
