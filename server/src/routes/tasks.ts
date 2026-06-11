import { Router, Response } from 'express';
import Task from '../models/Task';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/tasks — all tasks for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: 1 });
  res.json(tasks.map(toClient));
});

// POST /api/tasks — create task
router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, type, days, time, alarm } = req.body;

  if (!name || !days?.length) {
    res.status(400).json({ message: 'Nombre y al menos un día son requeridos' });
    return;
  }

  const task = await Task.create({
    userId: req.userId,
    name,
    type: type ?? 'positive',
    days,
    time: time || undefined,
    alarm: alarm ?? false,
  });

  res.status(201).json(toClient(task));
});

// PUT /api/tasks/:id — update task
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) {
    res.status(404).json({ message: 'Tarea no encontrada' });
    return;
  }

  const { name, type, days, time, alarm, status } = req.body;
  if (name !== undefined) task.name = name;
  if (type !== undefined) task.type = type;
  if (days !== undefined) task.days = days;
  if (time !== undefined) task.time = time || undefined;
  if (alarm !== undefined) task.alarm = alarm;
  if (status !== undefined) task.status = status;

  await task.save();
  res.json(toClient(task));
});

// DELETE /api/tasks/:id — delete task
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!task) {
    res.status(404).json({ message: 'Tarea no encontrada' });
    return;
  }
  res.json({ message: 'Tarea eliminada' });
});

function toClient(task: InstanceType<typeof Task>) {
  return {
    id: String(task._id),
    name: task.name,
    type: task.type,
    days: task.days,
    time: task.time,
    alarm: task.alarm,
    status: task.status,
    createdAt: task.createdAt.toISOString().split('T')[0],
  };
}

export default router;
