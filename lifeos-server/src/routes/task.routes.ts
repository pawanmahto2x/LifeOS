import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, queryTasksSchema } from '../validators/task.validator';

const router = Router();

// All task endpoints require authentication
router.use(authenticateUser);

router.get('/', validateRequest({ query: queryTasksSchema }), taskController.getTasks);

router.post('/', validateRequest({ body: createTaskSchema }), taskController.createTask);

router.get('/:taskId', taskController.getTaskById);

router.patch('/:taskId', validateRequest({ body: updateTaskSchema }), taskController.updateTask);

router.patch('/:taskId/complete', taskController.completeTask);

router.delete('/:taskId', taskController.deleteTask);

export default router;
