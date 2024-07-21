import express, { Request, Response } from "express";

import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './user/userRoutes';
import itemRoutes from './item/itemRoutes';
import mongoose from "mongoose";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.DATABASE_URL as string)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


///////////////////////////
// Mock user data
const users = [
  { id: 1, name: 'John1 Doe' },
  { id: 2, name: 'Jane1 Smith' }
];

// GET /user
app.get('/', (req: Request, res: Response) => {
  res.json(users);
});

// Use routes
app.use('/user', userRoutes);
app.use('/item', itemRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});