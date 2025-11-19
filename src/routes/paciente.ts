import express, { Request, Response } from 'express';
import prisma from '../prisma';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  const pacientes = await prisma.paciente.findMany();
  res.json(pacientes);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const paciente = await prisma.paciente.findUnique({ where: { PacienteID: id } });
  if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });
  res.json(paciente);
});

router.post('/', async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const created = await prisma.paciente.create({ data: payload });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const updated = await prisma.paciente.update({ where: { PacienteID: id }, data: req.body });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    await prisma.paciente.delete({ where: { PacienteID: id } });
    res.status(204).end();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
