const dbconnection = require('../../database/dbconnection')
const assert = require('assert')
const jwt = require('jsonwebtoken')

module.exports = {
    login: (req, res, next) => {
      //Asserting input for validation
      const { emailAdress, password } = req.body

      const queryString = 'SELECT id, firstName, lastName, emailAdress, password FROM USER WHERE emailAdress=?'
      
      dbconnection.getConnection(function (err, connection) {
          if (err) throw err
          connection.query(
            queryString, [emailAdress],
              function (error, results) {
                connection.release()
                if (error) throw error
                
                if (results && results.length === 1) {
                  //There was a user with this email address.
                  //Checking if the password was correct...
                  console.log(results)

                  const user = results[0]
                  if (user.password === password) {
                    //Email and password correct!

                    jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {expiresIn: '7d'}, function(err, token) {
                      if (err) console.log(err)
                      if (token) {
                        console.log(token)
                        res.status(200).json({
                          status: 200,
                          results: token
                        })
                      }
                    });
                  } else {
                    //Password did not match.
                  }
                } else {
                  //No user was found with this email address.
                  console.log('User not found')
                  res.status(404).json({
                    status: 404,
                    result: 'Email not found'
                  })
                }
              }
          )
      })
    },

    validate: (req, res, next) => {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        res.status(404).json({
          status: 404,
          result: "Authorization header missing"
        })
      } else {
        //Remove the word bearer from the token
        const token = authHeader.substring(7, authHeader.length)

        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
          if (err) {
            res.status(401).json({
              status: 401,
              result: "Not authorized"
            })
          } else if (payload) {
            //User has access. Add userId from payload to the request for every subsequent endpoint.
            req.userId = payload.userId
            next()
          }
        })
      }
    }
}
