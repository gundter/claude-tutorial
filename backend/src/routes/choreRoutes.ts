import { Router } from 'express';
import * as choreController from '../controllers/choreController.js';

const router = Router();

router.get('/', choreController.getAllChores);
router.get('/calendar/:year/:month', choreController.getChoresForCalendar);
router.get('/:id', choreController.getChoreById);
router.post('/', choreController.createChore);
router.put('/:id', choreController.updateChore);
router.patch('/:id/status', choreController.updateChoreStatus);
router.delete('/:id', choreController.deleteChore);

export default router;
