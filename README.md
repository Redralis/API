# Share-A-Meal-API

The Share-A-Meal-API is a project I made for school to further 
develop my understanding of javascript and nodejs.

## Features

- Log in as a user
- Create, retrieve, update and delete users
- Create, retrieve, update and delete meals

The API is hosted on Heroku.com.
Here's a link to the app: https://shareameal-api-lucas.herokuapp.com/
Endpoints and queries are listed below.

## Tech

Share-A-Meal uses a number of open source projects to work properly:

- [node.js] - evented I/O for the backend
- [Express] - fast node.js network app framework

## Installation

Share-A-Meal requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
npm i
npm run dev
```

## Endpoints
Login endpoint:
- POST(/api/auth/login) - Log in

User endpoints:
- POST(/api/user) - Register new user
- GET(/api/user) - Get all users
- GET(/api/user/profile) - Get personal profile
- GET(/api/user/:userId) - Get a user by id
- PUT(/api/user/:userId) - Update a user by id
- DELETE(/api/user/:userId) - Delete a user by id

Meal endpoints:
- POST(/api/meal) - Add meal
- PUT(/api/meal/:mealId) - Update meal by id
- GET(/api/meal) - Get all meals
- GET(/api/meal/:mealId) - Get meal by id
- DELETE(/api/meal/:mealId) - Delete meal by id

## Queries
You can perform URL queries to get specific results on the get all users endpoint.
All of these can be combined in 1 query by adding an `&` sign. Start queries with a `?`.
- ?firstName=(search by firstName)
- ?isActive=(search by isActive)
- ?amount=(specify amount of users shown)

## Development

Feel free to fork the repository and work on it. I'm not attached to it.
