const dbconnection = require('../../database/dbconnection')
const assert = require('assert')

let controller = {
    validateNewMeal: (req, res, next) => {
        let meal = req.body;
        let{name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price} = meal;
        try {
          assert(typeof name === 'string', 'Name must be a string');
          assert(typeof description === 'string', 'Description must be a string');
          assert(typeof isActive === 'boolean', 'isActive must be a boolean');
          assert(typeof isVega === 'boolean', 'isVega must be a boolean');
          assert(typeof isVegan === 'boolean', 'isVegan must be a boolean');
          assert(typeof isToTakeHome === 'boolean', 'isToTakeHome must be a boolean');
          assert(typeof dateTime === 'string', 'dateTime must be a string');
          assert(typeof imageUrl === 'string', 'imageUrl must be a string');
          assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
          assert(typeof price === 'number', 'Price must be a number');
          next();
        } catch(err) {
          const error = {
            statusCode: 400,
            message: err.message,
          }
          next(error);
        }
    },

    addMeal: (req, res, next) => {
      let meal = req.body
      if (meal.isActive) { meal.isActive = 1 } else { meal.isActive = 0 }
      if (meal.isVega) { meal.isVega = 1 } else { meal.isVega = 0 }
      if (meal.isVegan) { meal.isVegan = 1 } else { meal.isVegan = 0 }
      if (meal.isToTakeHome) { meal.isToTakeHome = 1 } else { meal.isToTakeHome = 0 }
      dbconnection.getConnection(function (err, connection, next) {
        if (err) throw err
        connection.query(
          "INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl," + 
            " allergenes, maxAmountOfParticipants, price, cookId) VALUES ('" + meal.name + "', '" + meal.description + "', " +
          meal.isActive + ", " + meal.isVega + ", " + meal.isVegan + ", " + meal.isToTakeHome + ", '" + 
          meal.dateTime + "', '" + meal.imageUrl + "', '" + meal.allergenes + "', " + meal.maxAmountOfParticipants + 
          ", " + meal.price + ", " + req.userId + ");",
          function (error) {
            if (error) throw error
            connection.query(
              "SELECT * FROM meal WHERE name = '" + meal.name + "'",
                function (error, results) {
                  let fullMeal = results[0]
                  fullMeal.allergenes = meal.allergenes
                  connection.query("SELECT * FROM user WHERE id = "+ req.userId, function (error, results) {
                    let user = results[0]
                    fullMeal.cook = user
                    connection.release()
                    if (error) throw error
                    console.log(fullMeal)
                    res.status(201).json({
                      statusCode: 201,
                      result: fullMeal
                    });
                  });
                });
          })
      })
    },

    getAllMeals: (req, res) => {
      let i = 0
      dbconnection.getConnection(function (err, connection) {
          if (err) throw err
          connection.query(
            "SELECT * FROM meal",
              function (error, results) {
                let meals = results
                connection.release()
                if (error) throw error
                console.log('Amount of meals = ', results.length)
                res.status(200).json({
                  statusCode: 200,
                  result: meals,
                })
              }
          )
      })
    },

    getMealById: (req, res, next) => {
      const mealId = req.params.mealId;
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err
        connection.query(
            'SELECT * FROM meal WHERE id = ' + mealId,
            function (error, results) {
              connection.release()
              if (error) throw error
              if (results.length > 0) {
                let meal = results[0]
                res.status(200).json({
                  statusCode: 200,
                  result: meal,
                })
              } else {
                const error = {
                  statusCode: 404,
                  message: `Meal with ID ${mealId} not found`,
                }
                next(error);
              }
            }
        )
      })
    },

    deleteMeal: (req, res, next) => {
      const mealId = req.params.mealId;
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err
        connection.query(
            'SELECT * FROM meal WHERE id = ' + mealId,
            function (error, results) {
              connection.release()
              if (error) throw error
              if (results.length > 0) {
                let meal = results[0]
                if (req.userId == meal.cookId) {
                  connection.query('DELETE FROM meal WHERE id = ' + mealId)
                  res.status(200).json({
                    statusCode: 200,
                    message: `Meal with ID ${mealId} successfully deleted`,
                  })
                }
                else {
                  res.status(403).json({
                    statusCode: 403,
                    message: `You need to be the owner of a meal to delete it`
                  })
                }
              } else {
                const error = {
                  statusCode: 400,
                  message: `Meal with ID ${mealId} not found`,
                }
                next(error);
              }
            }
        )
      })
    }
}

module.exports = controller;