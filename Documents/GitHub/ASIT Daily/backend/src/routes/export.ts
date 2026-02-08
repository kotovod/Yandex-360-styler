import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { User, TherapySession, Dose, SideEffect } from '../models/index.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Export therapy history as JSON
router.get('/data', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Get user info
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Get therapy session
    const session = await TherapySession.findOne({
      where: { user_id: userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Терапия не начата' });
    }

    // Get all doses
    const doses = await Dose.findAll({
      where: { therapy_session_id: session.id },
      order: [['date', 'DESC']],
    });

    // Get all side effects
    const sideEffects = await SideEffect.findAll({
      include: [{
        model: Dose,
        where: { therapy_session_id: session.id },
        attributes: ['date'],
      }],
      order: [['date', 'DESC']],
    });

    // Calculate statistics
    const totalDoses = doses.length;
    const takenDoses = doses.filter(d => d.taken).length;
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    res.json({
      user: {
        name: user.name,
        email: user.email,
      },
      therapy: {
        startDate: session.start_date,
        maintenanceDose: session.maintenance_dose,
        reminderTime: session.reminder_time,
      },
      statistics: {
        totalDoses,
        takenDoses,
        skippedDoses: totalDoses - takenDoses,
        adherenceRate,
        sideEffectsCount: sideEffects.length,
      },
      doses,
      sideEffects,
      exportDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Ошибка экспорта данных' });
  }
});

export default router;
