export interface HousekeepingTaskOptions {
  room_id: string;
  task_type: string;
  assigned_staff_id?: string | null;
  due_date?: string | null;
  reservation_id?: string | null; // For automatic tasks
  status?: string | null;
}

export interface TaskFilters {
  taskId?: string;
  status?: string;
  room_id?: string;
  assigned_staff_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface HousekeepingTaskResponse {
  id: string;
  room_id: string;
  reservation_id: string | null;
  task_type: string;
  status: string;
  assigned_staff_id: string | null;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TaskListResponse {
  tasks: HousekeepingTaskResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface IHousekeepingService {

  createTask(options: HousekeepingTaskOptions): Promise<HousekeepingTaskResponse>;

  listTasks(filters: TaskFilters): Promise<TaskListResponse>;
  
  updateTask(taskId: string, updateData: Partial<HousekeepingTaskOptions>): Promise<HousekeepingTaskResponse>;
}