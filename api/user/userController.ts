import { Request, Response } from 'express';
import { genSalt, hash, compare } from 'bcrypt';
import crypto from 'crypto';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { PrismaClient/* , User, InvitationCode */ } from '@prisma/client';
import { sendPasswordResetEmail } from '../utils/emailService';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  body: {
    email: string;
    password: string;
    name: string;
    newName?: string;
    code?: string;
    companyName?: string;
    companyLogo?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  userId?: string;
}

const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, name, companyName } = req.body;

  if (!companyName) {
    res.status(400).json({ error: 'Company name is required' });
    return;
  }

  try {
    // Check if the company exists; if not, create it
    let company = await prisma.company.findUnique({
      where: { name: companyName },
    });

    if (!company) {
      // Create the company since it doesn't exist
      let logoUri: string | undefined;
      if (req.file) {
        logoUri = req.file.path; // Store the uploaded logo path, if available
      }

      company = await prisma.company.create({
        data: {
          name: companyName,
          logoUri: logoUri || null, // Optional logo URI
        },
      });
    }

    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        companyId: company.id
      },
    });

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu', user });
    return;
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
    return;
  }
};

const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;
  console.log(email);

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
    console.log(passwordMatch);

    const token = sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    console.log(token);
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
    return;
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
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
  }
};

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    // Generate a temporary 8-character password
    const temporaryPassword = crypto.randomBytes(4).toString('hex').slice(0, 8); 
    const salt = await genSalt();
    const hashedPassword = await hash(temporaryPassword, salt);

    // Update the user's password in the database
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Send the temporary password by email
    await sendPasswordResetEmail(email, temporaryPassword);

    res.status(200).json({ message: 'Yeni şifre e-postanıza gönderildi.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error processing forgot password request' });
  }
};

const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req as { userId: string }; // Assume userId is added via authentication middleware

  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized: user ID not found.' });
    return;
  }

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new passwords are required.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    const salt = await genSalt();
    const hashedPassword = await hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

const renameUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params; // User ID from URL parameters
  const { newName } = req.body; // New name from request body

  if (!newName) {
    res.status(400).json({ error: 'New name is required' });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name: newName },
      select: { id: true, name: true, email: true }, // Select fields to return
    });

    res.status(200).json({ message: 'User name updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error renaming user:', error);
    res.status(500).json({ error: 'Failed to rename user' });
  }
};

const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params; // User ID from URL parameters

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: 'User deleted successfully', userId: id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const generateCode = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user || !user.company) {
      res.status(400).json({ error: 'User does not belong to a company' });
      return;
    }

    // Generate the invitation code
    const code = sign({ companyId: user.company.id }, process.env.JWT_SECRET || '', { expiresIn: '5m' });

    // Store the code with the associated company
    await prisma.invitationCode.create({
      data: {
        code,
        companyId: user.company.id,
      },
    });

    res.json({ code, companyName: user.company.name, companyLogo: user.company.logoUri });
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
    const companyId = decoded.companyId as string;

    if (!companyId) {
      res.status(400).json({ error: 'Invalid invitation code payload' });
      return;
    }

    const invitationCode = await prisma.invitationCode.findUnique({
      where: { code },
      include: { company: true }, // Include company data for response
    });

    if (invitationCode) {
      await prisma.invitationCode.delete({
        where: { code: code },
      });

      res.json({
        valid: true,
        companyName: invitationCode.company?.name,
        companyLogo: invitationCode.company?.logoUri,
      });
      return;
    } else {
      res.json({ valid: false, message: 'Invalid or already used code' });
      return
    }
  } catch (error) {
    console.error('Error validating invitation code:', error);
    res.status(500).json({ valid: false });
    return;
  }
};

export { createUser, loginUser, getUsers, generateCode, validateCode, forgotPassword, changePassword, renameUser, deleteUser };
