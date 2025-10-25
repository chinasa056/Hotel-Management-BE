import HousekeepingTaskModel, { IHousekeepingTask } from '../models/HousekeepingTask';
import { HousekeepingTaskOptions, HousekeepingTaskResponse, TaskFilters, TaskListResponse } from '../interfaces/housekeeping';
import { logger } from '../utils/logger';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import InternalServerError from '../error/InternalServerError';

class HousekeepingRepository {
  async create(options: HousekeepingTaskOptions): Promise<HousekeepingTaskResponse> {
    try {
      const task = new HousekeepingTaskModel(options);
      const savedTask = await task.save();
      return this.toResponse(savedTask);
    } catch (error) {
      logger.error(`Error creating task for room ${options.room_id}:`, error);
      throw new InternalServerError(
        'Failed to create housekeeping task',
        error instanceof Error ? error : new Error('Create task failed'),
        { room_id: options.room_id },
        false
      );
    }
  }

  async find(filters: TaskFilters): Promise<TaskListResponse> {
    try {
      const { status, room_id, assigned_staff_id, start_date, end_date, page = 1, limit = 10 } = filters;
      const query: any = {};
      if (status) query.status = status;
      if (room_id) query.room_id = room_id;
      if (assigned_staff_id) query.assigned_staff_id = assigned_staff_id;
      if (start_date || end_date) {
        query.due_date = {};
        if (start_date) query.due_date.$gte = new Date(start_date);
        if (end_date) query.due_date.$lte = new Date(end_date);
      }

      const skip = (page - 1) * limit;
      const tasks = await HousekeepingTaskModel.find(query).skip(skip).limit(limit);
      const total = await HousekeepingTaskModel.countDocuments(query);

      return {
        tasks: tasks.map(this.toResponse),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error listing tasks:', error);
      throw new InternalServerError(
        'Failed to list housekeeping tasks',
        error instanceof Error ? error : new Error('List tasks failed'),
        { filters },
        false
      );
    }
  }

  async update(taskId: string, updateData: Partial<HousekeepingTaskOptions>): Promise<HousekeepingTaskResponse> {
    try {
      const task = await HousekeepingTaskModel.findByIdAndUpdate(
        taskId,
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true }
      );
      if (!task) {
        throw new ResourceNotFoundError(
          `Task ${taskId} not found`,
          null,
          { taskId },
          false
        );
      }
      return this.toResponse(task);
    } catch (error) {
      logger.error(`Error updating task ${taskId}:`, error);
      if (error instanceof ResourceNotFoundError) throw error;
      throw new InternalServerError(
        'Failed to update housekeeping task',
        error instanceof Error ? error : new Error('Update task failed'),
        { taskId },
        false
      );
    }
  }

  private toResponse(task: IHousekeepingTask): HousekeepingTaskResponse {
    return {
      id: task._id as string,
      room_id: task.room_id,
      reservation_id: task.reservation_id,
      task_type: task.task_type,
      status: task.status,
      assigned_staff_id: task.assigned_staff_id,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }
}

export default new HousekeepingRepository();