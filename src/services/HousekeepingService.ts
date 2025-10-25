import { endOfDay, parseISO } from 'date-fns';
import SupabaseClientService from './SupabaseClientService';
import NotificationService from './NotificationService';
import HousekeepingRepository from '../repositories/HousekeepingRepository';
import { HousekeepingTaskOptions, HousekeepingTaskResponse, IHousekeepingService, TaskFilters, TaskListResponse } from '../interfaces/housekeeping';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import BadRequestError from '../error/BadRequestError';
// import InternalServerError from '../error/internalServerError';
import { logger } from '../utils/logger';

class HousekeepingService implements IHousekeepingService {
  async createTask(options: HousekeepingTaskOptions): Promise<HousekeepingTaskResponse> {
    try {
      // Validate room_id
      const room = await SupabaseClientService.selectFromTable('rooms', { id: options.room_id }, 'id, status');
      if (!room) {
        throw new ResourceNotFoundError(
          `Room ${options.room_id} not found`,
          null,
          { room_id: options.room_id },
          false
        );
      }

      // Validate assigned_staff_id if provided
      if (options.assigned_staff_id) {
        const staff = await SupabaseClientService.selectFromTable(
          'users',
          { id: options.assigned_staff_id, role: 'staff' },
          'id, name, email'
        );
        if (!staff) {
          throw new BadRequestError(
            `Staff ${options.assigned_staff_id} not found or not a staff role`,
            null,
            { assigned_staff_id: options.assigned_staff_id },
            false
          );
        }
      }

      // Validate task_type
      if (!['cleaning', 'maintenance'].includes(options.task_type)) {
        throw new BadRequestError(
          `Invalid task type: ${options.task_type}`,
          null,
          { task_type: options.task_type },
          false
        );
      }

      // Set due_date (dynamic or end of today)
      const due_date = options.due_date ? parseISO(options.due_date) : endOfDay(new Date());
      if (isNaN(due_date.getTime())) {
        throw new BadRequestError(
          `Invalid due_date: ${options.due_date}`,
          null,
          { due_date: options.due_date },
          false
        );
      }

      // Create task
      const taskData: HousekeepingTaskOptions = {
        room_id: options.room_id,
        reservation_id: options.reservation_id || null,
        task_type: options.task_type,
        status: 'pending',
        assigned_staff_id: options.assigned_staff_id || null,
        due_date : due_date.toISOString(),
      };
      const task = await HousekeepingRepository.create(taskData);

      // Send notification if assigned
      if (task.assigned_staff_id) {
        const staff = await SupabaseClientService.selectFromTable(
          'users',
          { id: task.assigned_staff_id },
          'name, email'
        );
        if (staff) {
          await NotificationService.sendTaskAssignment({
            email: staff.email,
            staffName: staff.name,
            roomId: task.room_id,
            taskType: task.task_type,
            dueDate: task.due_date,
            hotelName: 'Your Hotel',
            logoUrl: 'https://via.placeholder.com/150?text=Hotel+Logo',
          });
        }
      }

      logger.info(`Created task ${task.id} for room ${task.room_id}`);
      return task;
    } catch (error) {
      logger.error(`Error creating task for room ${options.room_id}:`, error);
      throw error;
    }
  }

  async listTasks(filters: TaskFilters): Promise<TaskListResponse> {
    try {
      return await HousekeepingRepository.find(filters);
    } catch (error) {
      logger.error('Error listing tasks:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updateData: Partial<HousekeepingTaskOptions>): Promise<HousekeepingTaskResponse> {
    try {
      // Validate assigned_staff_id if provided
      if (updateData.assigned_staff_id) {
        const staff = await SupabaseClientService.selectFromTable(
          'users',
          { id: updateData.assigned_staff_id, role: 'staff' },
          'id, name, email'
        );
        if (!staff) {
          throw new BadRequestError(
            `Staff ${updateData.assigned_staff_id} not found or not a staff role`,
            null,
            { assigned_staff_id: updateData.assigned_staff_id },
            false
          );
        }
      }

      // Validate task_type if provided
      if (updateData.task_type && !['cleaning', 'maintenance'].includes(updateData.task_type)) {
        throw new BadRequestError(
          `Invalid task type: ${updateData.task_type}`,
          null,
          { task_type: updateData.task_type },
          false
        );
      }

      // Validate due_date if provided
      if (updateData.due_date) {
        const due_date = parseISO(updateData.due_date);
        if (isNaN(due_date.getTime())) {
          throw new BadRequestError(
            `Invalid due_date: ${updateData.due_date}`,
            null,
            { due_date: updateData.due_date },
            false
          );
        }
        updateData.due_date = due_date.toISOString();
      }

      // Fetch current task to check for notification
      const currentTask = await HousekeepingRepository.find({ taskId });
      if (!currentTask.tasks.length) {
        throw new ResourceNotFoundError(
          `Task ${taskId} not found`,
          null,
          { taskId },
          false
        );
      }

      // Update task
      const task = await HousekeepingRepository.update(taskId, updateData);

      // Update room status if completed cleaning task
      if (task.status === 'completed' && task.task_type === 'cleaning') {
        await SupabaseClientService.updateTable(
          'rooms',
          { status: 'Vacant' },
          { id: task.room_id }
        );
        logger.info(`Set room ${task.room_id} to Vacant after task ${taskId} completion`);
      }

      // Send notification if assigned_staff_id changed
      if (task.assigned_staff_id && task.assigned_staff_id !== currentTask.tasks[0].assigned_staff_id) {
        const staff = await SupabaseClientService.selectFromTable(
          'users',
          { id: task.assigned_staff_id },
          'name, email'
        );
        if (staff) {
          await NotificationService.sendTaskAssignment({
            email: staff.email,
            staffName: staff.name,
            roomId: task.room_id,
            taskType: task.task_type,
            dueDate: task.due_date,
            hotelName: 'Your Hotel',
            logoUrl: 'https://via.placeholder.com/150?text=Hotel+Logo',
          });
        }
      }

      logger.info(`Updated task ${taskId}`);
      return task;
    } catch (error) {
      logger.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  }
}

export default new HousekeepingService();