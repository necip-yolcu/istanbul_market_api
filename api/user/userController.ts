import { Request, Response } from 'express';
import { genSalt, hash, compare } from 'bcrypt';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
//import { PrismaClient/* , User, InvitationCode */ } from '@prisma/client';

//const prisma = new PrismaClient();
/* 
interface AuthRequest extends Request {
  body: {
    email: string;
    password: string;
    name: string;
    code?: string;
  };
}

const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  try {
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json(user);
    return;
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
    return;
  }
};

const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate user' });
    return;
  }
}; */

const getUsers = async (req: Request, res: Response) => {
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];

  return res.json(users);
  /* try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    res.json(users);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
    return;
  } */
};
/* 
const generateCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = sign({}, process.env.JWT_SECRET || '', { expiresIn: '5m' });

    // Store the code in your database
    await prisma.invitationCode.create({
      data: { code },
    });

    res.json({ code });
    return;
  } catch (error) {
    console.error('Error generating invitation code:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

const validateCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = verify(code, secret) as JwtPayload;

    const invitationCode = await prisma.invitationCode.findUnique({
      where: { code },
    });

    if (invitationCode) {
      await prisma.invitationCode.delete({
        where: { code: code },
      });

      res.json({ valid: true });
      return;
    } else {
      res.json({ valid: false });
      return;
    }
  } catch (error) {
    console.error('Error validating invitation code:', error);
    res.status(500).json({ valid: false });
    return;
  }
};

export { createUser, loginUser, getUsers, generateCode, validateCode };
 */

export { getUsers}