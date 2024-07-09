const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./user/userRoutes');
const itemRoutes = require('./item/itemRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());


///////////////////////////
// Mock user data
const users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' }
];

// GET /user
app.get('/', (req, res) => {
  res.json(users);
});

// GET /user/:id
app.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
///////////////////////////


// Use routes
app.use('/user', userRoutes);
app.use('/item', itemRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});