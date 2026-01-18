import { Router } from 'express';
import * as reminderController from '../controllers/reminderController.js';

const router = Router();

router.get('/check', reminderController.checkReminders);
router.get('/upcoming', reminderController.getUpcoming);
router.get('/overdue', reminderController.getOverdue);

export default router;
