import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController';

const router = Router();

router.post('/', vehicleController.createVehicle);
router.delete('/:vehicleId', vehicleController.deleteVehicle);

export default router;
