const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const userRouter = require('./src/routes/user.routes');
const { env } = require('process');

app.use(bodyParser.json());

app.all('*', (req, res, next) => {
  const method = req.method
  console.log(`Methode ${method} aangeroepen`)
  next()
});

app.use(userRouter);

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