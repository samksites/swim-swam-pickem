import { Router, Request, Response } from 'express';
import adminService from '../services/admin.service';
import { logLevels } from '../services/logger';
import { extractUserId, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(extractUserId('body'), requireAdmin);

router.post('/users/query', async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const users = await adminService.searchUsersByName(name);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    logLevels.error('Failed to query users', {
      userId: req.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      name: req.body?.name,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to query users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;