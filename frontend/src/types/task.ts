export type TaskCategory = 'DSA' | 'CORE_CS' | 'FULL_STACK' | 'APTITUDE';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
  completedAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskFormInput = {
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
};

export type TaskFilters = {
  category?: TaskCategory;
  status?: TaskStatus;
  search?: string;
};
