import { Request, Response } from 'express';
import prisma from '../prisma';

export async function createVehicle(req: Request, res: Response) {
  const { plateNumber, ownerId, villaId, isVisitor, expectedDeparture, modelName } = req.body;
  if (!plateNumber || !ownerId || !villaId) {
    return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
  }
  const parsedVillaId = parseInt(String(villaId), 10);
  if (isNaN(parsedVillaId)) {
    return res.status(400).json({ message: '빌라 정보가 올바르지 않습니다.' });
  }
  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        modelName: modelName || null,
        ownerId,
        villaId: parsedVillaId,
        isVisitor: Boolean(isVisitor),
        expectedDeparture: expectedDeparture || null,
      },
    });
    res.status(201).json(vehicle);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

export async function deleteVehicle(req: Request, res: Response) {
  try {
    await prisma.vehicle.delete({ where: { id: String(req.params.vehicleId) } });
    res.json({ message: '차량이 삭제되었습니다.' });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }
    res.status(500).json({ message: err.message });
  }
}
