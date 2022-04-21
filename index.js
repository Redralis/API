const express = require('express');
const app = express()
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const { env } = require('process');

app.use(bodyParser.json());

let database = [];
let id = 0;

app.all('*', (req, res, next) => {
  const method = req.method
  console.log(`Methode ${method} aangeroepen`)
  next()
});

//UC-201 - Register as a new user
app.post('/api/user', (req, res) => {
  let user = req.body;
  console.log(user);
  id++;
  user = {
    id,
    ...user,
  };
  database.push(user);
  console.log(database)
  res.status(201).json({
    status: 201,
    result: user,
  });
});

//UC-202 - Get all users
app.get('/api/user', (req, res) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

//UC-204 - Get single user by ID
app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  let user = database.filter((item) => (item.id == userId));
  if (user.length > 0) {
    res.status(200).json({
      status: 200,
      result: user,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `User with ID ${userId} not found`,
    });
  }
});

//Standard response
app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    result: 'Hello World!',
  });
});

//Response for incorrect request
app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    result: 'End-point not found',
  })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});