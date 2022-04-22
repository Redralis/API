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
  const emailAdress = user.emailAdress;
  user = {
    id,
    ...user,
  };
  //If the new user's email is unique, the user will be pushed to the database. Otherwise, an error will be returned.
  if (!database.some(e => e.emailAdress === emailAdress)) {
    id++;
    while (database.some(e => e.id === id)) {
      id++;
    }
    database.push(user);
    console.log(database)
    res.status(201).json({
      status: 201,
      result: user,
    });
  } else {
    res.status(422).json({
      status: 422,
      result: `Email address ${emailAdress} is already registered.`
    });
  }
});

//UC-202 - Get all users
app.get('/api/user', (req, res) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

//UC-203 - Request personal user profile
app.get('/api/user/profile', (req, res) => {
  //This function is a WIP, so it will only return a message stating this.
  res.status(401).json({
    status: 401,
    result: 'Endpoint not yet realised',
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

//UC-205 - Update a single user
app.put('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  let oldId = id;
  id = userId;
  let user = database.filter((item) => (item.id == userId));
  if (user.length > 0) {
    index = database.findIndex((obj => obj.id == userId));
    user = req.body;
    //If no id was specified during the update, the updated user's id will be set to its previous one.
    if (!user.id >= 0) {
      user = {
        id,
        ...user,
      };
    }
    id = oldId;
    database[index] = user;
    console.log(user);
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

//UC-206 - Delete a user
app.delete('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  let user = database.filter((item) => (item.id == userId));
  if (user.length > 0) {
    index = database.findIndex((obj => obj.id == userId));
    database.splice(index, 1);
    res.status(200).json({
      status: 200,
      result: `User with ID ${userId} succesfully deleted`,
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