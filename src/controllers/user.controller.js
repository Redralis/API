const dbconnection = require('../../database/dbconnection')
const assert = require('assert')

let controller = {
    standardResponse: (req, res) => {
      res.status(200).json({
          status: 200,
          result: 'Hello World!',
      });
    },

    validateNewUser: (req, res, next) => {
        let user = req.body;
        let{firstName, lastName, street, city, password, emailAdress} = user;
        try {
          assert(typeof firstName === 'string', 'First name must be a string');
          assert(typeof lastName === 'string', 'Last name must be a string');
          assert(typeof street === 'string', 'Street must be a string');
          assert(typeof city === 'string', 'City must be a string');
          assert(typeof password === 'string', 'Password must be a string');
          assert(typeof emailAdress === 'string', 'Email adress must be a string');
          next();
        } catch(err) {
          const error = {
            status: 400,
            result : err.message,
          }
          next(error);
        }
    },

    validateUpdatedUser: (req, res, next) => {
      let user = req.body;
      let{firstName, lastName, street, city, isActive, password, emailAdress, phoneNumber} = user;
      try {
        assert(typeof firstName === 'string', 'First name must be a string');
        assert(typeof lastName === 'string', 'Last name must be a string');
        assert(typeof street === 'string', 'Street must be a string');
        assert(typeof city === 'string', 'City must be a string');
        assert(typeof isActive === 'boolean', 'isActive must be a boolean');
        assert(typeof password === 'string', 'Password must be a string');
        assert(typeof emailAdress === 'string', 'Email adress must be a string');
        assert(typeof phoneNumber === 'string', 'Phone number must be a string');
        next();
      } catch(err) {
        const error = {
          status: 400,
          result : err.message,
        }
        next(error);
      }
  },

    addUser: (req, res, next) => {
      let user = req.body;
      dbconnection.getConnection(function (err, connection, next) {
        if (err) throw err
        connection.query(
          "INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES ('" + user.firstName + "', '" + 
          user.lastName + "', '" + user.street + "', '" + user.city + "', '" + user.password + "', '" + user.emailAdress + "');",
          function (error) {
            if (error) {
              if(error.errno==1062){   
                res.status(422).json({
                  status: 422,
                  result: 'Email address is already registered',
                });
              } else {
                throw error;
              }
            } else {
            connection.release()
            res.status(201).json({
              status: 201,
              result: user,
            });
            }
          })
      })
    },

    getAllUsers: (req, res) => {
      dbconnection.getConnection(function (err, connection) {
          if (err) throw err
          connection.query(
              'SELECT * FROM user;',
              function (error, results) {
                connection.release()
                if (error) throw error
                console.log('Amount of users = ', results.length)
                res.status(200).json({
                  status: 200,
                  results: results,
                })
              }
          )
      })
    },

    getPersonalProfile: (req, res) => {
      //This function is a WIP, so it will only return a message stating this.
      res.status(401).json({
        status: 401,
        result: 'Endpoint not yet realised',
      });
    },

    getUserById: (req, res, next) => {
      const userId = req.params.userId;
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err
        connection.query(
            'SELECT * FROM user WHERE id = ' + userId,
            function (error, results) {
              connection.release()
              if (error) throw error
              if (results.length > 0) {
                res.status(200).json({
                  status: 200,
                  results: results,
                })
              } else {
                const error = {
                  status: 404,
                  result: `User with ID ${userId} not found`,
                }
                next(error);
              }
            }
        )
      })
    },

    updateUser: (req, res, next) => {
      const userId = req.params.userId;
      let user = req.body;
      let isActive = 0;
      if (user.isActive) {
        isActive = 1;
      }
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err
        connection.query(
            'SELECT * FROM user WHERE id = ' + userId,
            function (error, results) {
              connection.release()
              if (error) throw error
              if (results.length > 0) {
                connection.query("UPDATE user SET id = " + user.id + ", firstName = '" + user.firstName + 
                "', lastName = '" + user.lastName + "', street = '" + user.street + "', city = '" + user.city +
                "', isActive = '" + isActive + "', emailAdress = '" + user.emailAdress + "', password = '" +
                user.password + "', phoneNumber = '" + user.phoneNumber + "' WHERE id = " + userId)
                res.status(200).json({
                  status: 200,
                  results: `User with ID ${userId} successfully updated`,
                })
              } else {
                const error = {
                  status: 404,
                  result: `User with ID ${userId} not found`,
                }
                next(error);
              }
            }
        )
      })
    },

    deleteUser: (req, res, next) => {
      const userId = req.params.userId;
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err
        connection.query(
            'SELECT * FROM user WHERE id = ' + userId,
            function (error, results) {
              connection.release()
              if (error) throw error
              if (results.length > 0) {
                connection.query('DELETE FROM user WHERE id = ' + userId)
                res.status(200).json({
                  status: 200,
                  results: `User with ID ${userId} successfully deleted`,
                })
              } else {
                const error = {
                  status: 404,
                  result: `User with ID ${userId} not found`,
                }
                next(error);
              }
            }
        )
      })
    }
}

module.exports = controller;