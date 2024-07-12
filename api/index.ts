import express, { Request, Response } from "express";

import bodyParser from 'body-parser';
import cors from 'cors';

import userRoutes from './user/userRoutes';
import itemRoutes from './item/itemRoutes';

const app = express();
app.use(cors());
app.use(bodyParser.json());


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

/* // GET /user/:id
app.get('/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
///////////////////////////*/


// Use routes
app.use('/user', userRoutes);
//app.use('/item', itemRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});