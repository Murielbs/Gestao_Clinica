import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  try {
    const rows: any = await prisma.$queryRaw`SELECT * FROM \`Médico\` WHERE Email = ${email} LIMIT 1`;
    const medico = Array.isArray(rows) ? rows[0] : rows;
    if (!medico) return res.status(401).json({ error: 'Credenciais inválidas' });

    const stored: string | undefined = medico.Senha ?? medico.senha ?? medico.Password ?? medico.password;
    if (!stored) return res.status(500).json({ error: 'Senha não encontrada para o usuário' });

    let passwordMatch = false;
    if (typeof stored === 'string' && (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$'))) {
      passwordMatch = await bcrypt.compare(senha, stored);
    } else {
      passwordMatch = senha === stored;
    }

    if (!passwordMatch) return res.status(401).json({ error: 'Credenciais inválidas' });

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ medicoId: medico.MedicoID, email: medico.Email }, secret, { expiresIn: '8h' });

    res.json({ token, medico: { MedicoID: medico.MedicoID, NomeCompleto: medico.NomeCompleto, Email: medico.Email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
