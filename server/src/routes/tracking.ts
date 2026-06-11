import { Router, Response } from 'express';
import TrackingLog from '../models/TrackingLog';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/tracking?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns all logs for the user within an optional date range
router.get('/', async (req: AuthRequest, res: Response) => {
  const filter: Record<string, unknown> = { userId: req.userId };

  const { from, to } = req.query;
  if (from || to) {
    filter.date = {};
    if (from) (filter.date as Record<string, unknown>)['$gte'] = from;
    if (to)   (filter.date as Record<string, unknown>)['$lte'] = to;
  }

  const logs = await TrackingLog.find(filter);
  res.json(logs.map(toClient));
});

// POST /api/tracking — create or update a log entry
router.post('/', async (req: AuthRequest, res: Response) => {
  const { taskId, date, status } = req.body;

  if (!taskId || !date || !status) {
    res.status(400).json({ message: 'taskId, date y status son requeridos' });
    return;
  }
  if (!['completed', 'failed'].includes(status)) {
    res.status(400).json({ message: 'status debe ser "completed" o "failed"' });
    return;
  }

  const log = await TrackingLog.findOneAndUpdate(
    { taskId, date, userId: req.userId },
    { status },
    { upsert: true, new: true }
  );

  res.status(201).json(toClient(log));
});

// DELETE /api/tracking/:taskId/:date — remove a log entry
router.delete('/:taskId/:date', async (req: AuthRequest, res: Response) => {
  const { taskId, date } = req.params;

  await TrackingLog.findOneAndDelete({ taskId, date, userId: req.userId });
  res.json({ message: 'Registro eliminado' });
});

function toClient(log: InstanceType<typeof TrackingLog>) {
  return {
    id: String(log._id),
    taskId: String(log.taskId),
    date: log.date,
    status: log.status,
  };
}

export default router;
