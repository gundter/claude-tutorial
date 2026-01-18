import { Router } from 'express';
import teamMemberRoutes from './teamMemberRoutes.js';
import choreRoutes from './choreRoutes.js';
import reminderRoutes from './reminderRoutes.js';

const router = Router();

router.use('/team-members', teamMemberRoutes);
router.use('/chores', choreRoutes);
router.use('/reminders', reminderRoutes);

export default router;
