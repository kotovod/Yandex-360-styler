import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { TherapySession, Dose, SideEffect } from '../models/index.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get current therapy session and today's dose
router.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Get therapy session
    const session = await TherapySession.findOne({
      where: { user_id: userId },
    });

    if (!session) {
      return res.json({ session: null, todayDose: null });
    }

    // Get today's dose
    const today = new Date().toISOString().split('T')[0];
    const todayDose = await Dose.findOne({
      where: {
        therapy_session_id: session.id,
        date: today,
      },
    });

    res.json({
      session: {
        id: session.id,
        userId: session.user_id,
        startDate: session.start_date,
        maintenanceDose: session.maintenance_dose,
        reminderTime: session.reminder_time,
        createdAt: session.createdAt,
      },
      todayDose: todayDose ? {
        id: todayDose.id,
        therapySessionId: todayDose.therapy_session_id,
        date: todayDose.date,
        taken: todayDose.taken,
        doseCount: todayDose.dose_count,
        concentration: todayDose.concentration,
        notes: todayDose.notes,
        createdAt: todayDose.createdAt,
      } : null,
    });
  } catch (error) {
    console.error('Get current therapy error:', error);
    res.status(500).json({ error: 'Ошибка загрузки данных' });
  }
});

// Start therapy session
router.post('/start', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { startDate, maintenanceDose, reminderTime } = req.body;

    if (!startDate || !maintenanceDose || !reminderTime) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Check if session already exists
    let session = await TherapySession.findOne({
      where: { user_id: userId },
    });

    if (session) {
      // Update existing session
      await session.update({
        maintenance_dose: maintenanceDose,
        reminder_time: reminderTime,
      });
    } else {
      // Create new session
      session = await TherapySession.create({
        user_id: userId,
        start_date: startDate,
        maintenance_dose: maintenanceDose,
        reminder_time: reminderTime,
      });
    }

    res.json({ session });
  } catch (error) {
    console.error('Start therapy error:', error);
    res.status(500).json({ error: 'Ошибка создания терапии' });
  }
});

// Take dose
router.post('/take-dose', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { date, doseCount, concentration, notes } = req.body;

    if (!date || !doseCount || !concentration) {
      return res.status(400).json({ error: 'Обязательные поля: date, doseCount, concentration' });
    }

    // Get therapy session
    const session = await TherapySession.findOne({
      where: { user_id: userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Терапия не начата' });
    }

    // Upsert dose record
    const [dose] = await Dose.upsert({
      therapy_session_id: session.id,
      date,
      taken: true,
      dose_count: doseCount,
      concentration,
      notes: notes || null,
    });

    res.json({ dose });
  } catch (error) {
    console.error('Take dose error:', error);
    res.status(500).json({ error: 'Ошибка сохранения приёма' });
  }
});

// Skip dose
router.put('/skip-dose', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Дата обязательна' });
    }

    // Get therapy session
    const session = await TherapySession.findOne({
      where: { user_id: userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Терапия не начата' });
    }

    // Create/update skipped dose record
    const [dose] = await Dose.upsert({
      therapy_session_id: session.id,
      date,
      taken: false,
      notes: reason || null,
    });

    res.json({ dose });
  } catch (error) {
    console.error('Skip dose error:', error);
    res.status(500).json({ error: 'Ошибка пропуска приёма' });
  }
});

// Get history
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || 30;

    // Get therapy session
    const session = await TherapySession.findOne({
      where: { user_id: userId },
    });

    if (!session) {
      return res.json([]);
    }

    // Get dose history
    const doses = await Dose.findAll({
      where: { therapy_session_id: session.id },
      order: [['date', 'DESC']],
      limit,
    });

    // Transform to camelCase
    const transformedDoses = doses.map(dose => ({
      id: dose.id,
      therapySessionId: dose.therapy_session_id,
      date: dose.date,
      taken: dose.taken,
      doseCount: dose.dose_count,
      concentration: dose.concentration,
      notes: dose.notes,
      createdAt: dose.createdAt,
    }));

    res.json(transformedDoses);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Ошибка загрузки истории' });
  }
});

// Add side effect
router.post('/side-effect', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { doseRecordId, type, severity, description } = req.body;

    if (!doseRecordId || !type || !severity) {
      return res.status(400).json({ error: 'Обязательные поля: doseRecordId, type, severity' });
    }

    // Verify dose belongs to user
    const dose = await Dose.findByPk(doseRecordId, {
      include: [{
        model: TherapySession,
        where: { user_id: userId },
      }],
    });

    if (!dose) {
      return res.status(404).json({ error: 'Запись о приёме не найдена' });
    }

    // Create side effect
    const sideEffect = await SideEffect.create({
      dose_record_id: doseRecordId,
      date: new Date().toISOString().split('T')[0],
      type,
      severity,
      description: description || null,
    });

    res.json({ sideEffect });
  } catch (error) {
    console.error('Add side effect error:', error);
    res.status(500).json({ error: 'Ошибка добавления побочного эффекта' });
  }
});

export default router;
