import { Request, Response } from 'express';
import HousekeepingService from '../services/HousekeepingService';
import { responseHandler } from '../utils/responseHandler';
import { HousekeepingTaskOptions, TaskFilters, HousekeepingTaskResponse, TaskListResponse } from '../interfaces/housekeeping';

class HousekeepingController {
    private housekeepingService: typeof HousekeepingService;

    constructor(housekeepingService: typeof HousekeepingService) {
        this.housekeepingService = housekeepingService;
    }

    async createTask(req: Request, res: Response): Promise<void> {
        try {
            const options: HousekeepingTaskOptions = req.body;

            const task: HousekeepingTaskResponse = await this.housekeepingService.createTask(options);

            res.status(201).json(responseHandler(task, 'Task created successfully'));

        } catch (error) {
            res.status(500).json({
                message: error instanceof Error ? error.message : 'Failed to create task',
                error: (error as any).httpCode || 400,
                data: null
            })
        }
    }

    async listTasks(req: Request, res: Response): Promise<void> {
        try {
            const filters: TaskFilters = {
                status: req.query.status as string,
                room_id: req.query.room_id as string,
                assigned_staff_id: req.query.assigned_staff_id as string,
                start_date: req.query.start_date as string,
                end_date: req.query.end_date as string,
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            };

            const result: TaskListResponse = await this.housekeepingService.listTasks(filters);

            res.status(201).json(responseHandler(result, 'Tasks retrieved successfully'));

        } catch (error) {
            res.status(500).json({
                message: error instanceof Error ? error.message : 'Failed to create task',
                error: (error as any).httpCode || 400,
                data: null
            })
        }
    }

    async updateTask(req: Request, res: Response): Promise<void> {
        try {
            const taskId = req.params.taskId;
            const updateData: Partial<HousekeepingTaskOptions> = req.body;

            const task: HousekeepingTaskResponse = await this.housekeepingService.updateTask(taskId, updateData);

            res.status(201).json(responseHandler(task, 'task updated successfully'));


        } catch (error) {
            res.status(500).json({
                message: error instanceof Error ? error.message : 'Failed to create task',
                error: (error as any).httpCode || 400,
                data: null
            })
        }
    }
}

export default new HousekeepingController(HousekeepingService);