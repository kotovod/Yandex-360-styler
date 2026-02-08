import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { PushSubscription } from '../models/index.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Subscribe to push notifications
router.post('/subscribe', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Некорректная подписка' });
    }

    // Save subscription
    await PushSubscription.upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      keys: JSON.stringify(subscription.keys),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Ошибка подписки' });
  }
});

export default router;
