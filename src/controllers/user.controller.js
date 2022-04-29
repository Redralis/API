const dbconnection = require('../../database/dbconnection')
const assert = require('assert')

let controller = {
    standardResponse: (req, res) => {
      res.status(200).json({
          status: 200,
          result: 'Hello World!',
      });
    },

    validateUser: (req, res, next) => {
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

    addUser: (req, res, next) => {
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
        const error = {
          status: 422,
          result: `Email address ${emailAdress} is already registered.`,
        }
        next(error);
      }
    },

    getAllUsers: (req, res, next) => {
      dbconnection.getConnection(function (err, connection) {
          if (err) throw err // not connected!

          // Use the connection
          connection.query(
              'SELECT id, name FROM meal;',
              function (error, results, fields) {
                // When done with the connection, release it.
                connection.release()
                // Handle error after the release.
                if (error) throw error
                // Don't use the connection here, it has been returned to the pool.
                console.log('#results = ', results.length)
                res.status(200).json({
                  status: 200,
                  results: results,
                })
                // pool.end((err) => {
                //     console.log('pool was closed.')
                // })
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
      let user = database.filter((item) => (item.id == userId));
      if (user.length > 0) {
        res.status(200).json({
          status: 200,
          result: user,
        });
      } else {
        const error = {
          status: 404,
          result: `User with ID ${userId} not found`,
        }
        next(error);
      }
    },

    updateUser: (req, res, next) => {
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
        const error = {
          status: 404,
          result: `User with ID ${userId} not found`,
        }
        next(error);
      }
    },

    deleteUser: (req, res, next) => {
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
        const error = {
          status: 404,
          result: `User with ID ${userId} not found`,
        }
        next(error);
      }
    }
}

module.exports = controller;