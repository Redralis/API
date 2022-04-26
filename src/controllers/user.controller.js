let database = [];
let id = 0;

let controller = {
    standardResponse: (req, res) => {
      res.status(200).json({
          status: 200,
          result: 'Hello World!',
      });
    },

    addUser: (req, res) => {
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
    },

    getAllUsers: (req, res) => {
      res.status(200).json({
          status: 200,
          result: database,
      });
    },

    getPersonalProfile: (req, res) => {
      //This function is a WIP, so it will only return a message stating this.
      res.status(401).json({
        status: 401,
        result: 'Endpoint not yet realised',
      });
    },

    getUserById: (req, res) => {
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
    },

    updateUser: (req, res) => {
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
    },

    deleteUser: (req, res) => {
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
    }
}

module.exports = controller;