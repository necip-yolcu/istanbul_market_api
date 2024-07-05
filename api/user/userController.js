const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    res.status(200).json({ 
      id: user.id,
      name: user.name,
      email: user.email, 
      token 
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

const generateCode = async (req, res) => {
  try {
    const code = jwt.sign({}, process.env.JWT_SECRET || '', { expiresIn: '5m' });

    // Store the code in your database
    await prisma.invitationCode.create({
      data: { code },
    });

    res.json({ code });
  } catch (error) {
    console.error('Error generating invitation code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const validateCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    const decoded = jwt.verify(code, process.env.JWT_SECRET || '');

    // Check if the decoded code exists
    const invitationCode = await prisma.invitationCode.findUnique({
      where: { code },
    });

    if (invitationCode) {
       // Delete the code from the database
       await prisma.invitationCode.delete({
        where: { code: code },
      });

      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error('Error validating invitation code:', error);
    res.json({ valid: false });
  }
};

module.exports = {
  createUser,
  loginUser,
  getUsers,

  generateCode,
  validateCode
}
