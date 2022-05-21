process.env.DB_DATABASE = process.env.DB_DATABASE || 'share_a_meal_testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')
const { expect } = require('chai')
const token = process.env.TESTING_TOKEN

chai.should()
chai.use(chaiHttp)

//This line removes console.log, so that you can see the list of tests more easily.
console.log = function() {};

describe('Manage meals', () => {
  before((done) => {
    done()
  })

  describe('UC-301 - Create new meal /api/meal', () => {
    beforeEach(async () => {
      const promisePool = dbconnection.promise();
      await promisePool.query("DELETE IGNORE FROM meal_participants_user");
      await promisePool.query("DELETE IGNORE FROM  meal");
      await promisePool.query("DELETE IGNORE FROM  user");
      await promisePool.query(
        'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
        '(1, "John", "Doe", "john.doe@mail.com", "secret", "Lovensdijkstraat 73", "Breda"),' +
        '(2, "Lucas", "Kleijn", "lucas.kleijn@mail.com", "password", "Hogeschoollaan 91", "Breda");'
      );
      await promisePool.query(
        'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
        "(1, 'Fries', 'Fries with a side of salad', 'www.fries.com', NOW(), 5, 6.50, 1)," +
        "(2, 'Fried chicken', 'Some fried chicken for your delight.', 'www.chicken.com', NOW(), 3, 10.5, 2);"
      );
    });

    it('TC-301-1 - When a required input is missing, a valid error should be returned', (done) => {
      console.log(token)
      chai
      .request(server)
      .post('/api/meal')
      .set('Authorization', `Bearer ${token}`)
      .send({
        //Name is missing
        "description": "A royal dessert",
        "isActive": true,
        "isVega": true,
        "isVegan": true,
        "isToTakeHome": true,
        "imageUrl": "www.icecream.com",
        "dateTime": "2022-05-21 14:41:41",
        "maxAmountOfParticipants": 2,
        "price": 12.5,
        "cookId": 1,
        "allergenes": [
          "gluten",
          "noten",
          "lactose"
        ]
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, message} = res.body;
        statusCode.should.equals(400);
        message.should.be.a('string').that.equals('Name must be a string');
        done();
      })
    });

    it('TC-301-2 - When a user is not logged in and tries to create a meal, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/meal')
      .send({
        "name": "Ice cream",
        "description": "A royal dessert",
        "isActive": true,
        "isVega": true,
        "isVegan": true,
        "isToTakeHome": true,
        "imageUrl": "www.icecream.com",
        "dateTime": "2022-05-21 14:41:41",
        "maxAmountOfParticipants": 2,
        "price": 12.5,
        "cookId": 1,
        "allergenes": [
          "gluten",
          "noten",
          "lactose"
        ]
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, message} = res.body;
        statusCode.should.equals(401);
        message.should.be.a('string').that.equals('Authorization header missing');
        done();
      })
    });

    it('TC-301-3 - When a new meal is successfully created, a valid response should be returned', (done) => {
      chai
      .request(server)
      .post('/api/meal')
      .set('Authorization', `Bearer ${token}`)
      .send({
        "name": "Ice cream",
        "description": "A royal dessert",
        "isActive": true,
        "isVega": true,
        "isVegan": true,
        "isToTakeHome": true,
        "imageUrl": "www.icecream.com",
        "dateTime": "2022-05-21 14:41:41",
        "maxAmountOfParticipants": 2,
        "price": 12.5,
        "cookId": 1,
        "allergenes": [
          "gluten",
          "noten",
          "lactose"
        ]
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, result} = res.body;
        statusCode.should.equals(201);
        result.should.be.an('object').that.has.all.keys("id", "name", "description", "isActive", "isVega", "isVegan", "isToTakeHome", 
        "imageUrl", "dateTime", "maxAmountOfParticipants", "price", "cookId", "allergenes", "cook", "createDate", "updateDate")
        done();
      })
    });
  });

  describe('UC-303 - Get all meals /api/meal', () => {
    beforeEach(async () => {
      const promisePool = dbconnection.promise();
      await promisePool.query("DELETE IGNORE FROM meal_participants_user");
      await promisePool.query("DELETE IGNORE FROM  meal");
      await promisePool.query("DELETE IGNORE FROM  user");
      await promisePool.query(
        'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
        '(1, "John", "Doe", "john.doe@mail.com", "secret", "Lovensdijkstraat 73", "Breda"),' +
        '(2, "Lucas", "Kleijn", "lucas.kleijn@mail.com", "password", "Hogeschoollaan 91", "Breda");'
      );
      await promisePool.query(
        'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
        "(1, 'Fries', 'Fries with a side of salad', 'www.fries.com', NOW(), 5, 6.50, 1)," +
        "(2, 'Fried chicken', 'Some fried chicken for your delight.', 'www.chicken.com', NOW(), 3, 10.5, 2);"
      );
    });

    it('TC-303-1 - When a list of all meals is successfully requested, a valid response should be returned', (done) => {
      console.log(token)
      chai
      .request(server)
      .get('/api/meal')
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, result} = res.body;
        statusCode.should.equals(200);
        expect(result).to.have.lengthOf(2)
        done();
      })
    });
  });

  describe('UC-304 - Show a single meal /api/meal', () => {
    beforeEach(async () => {
      const promisePool = dbconnection.promise();
      await promisePool.query("DELETE IGNORE FROM meal_participants_user");
      await promisePool.query("DELETE IGNORE FROM  meal");
      await promisePool.query("DELETE IGNORE FROM  user");
      await promisePool.query(
        'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
        '(1, "John", "Doe", "john.doe@mail.com", "secret", "Lovensdijkstraat 73", "Breda"),' +
        '(2, "Lucas", "Kleijn", "lucas.kleijn@mail.com", "password", "Hogeschoollaan 91", "Breda");'
      );
      await promisePool.query(
        'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
        "(1, 'Fries', 'Fries with a side of salad', 'www.fries.com', NOW(), 5, 6.50, 1)," +
        "(2, 'Fried chicken', 'Some fried chicken for your delight.', 'www.chicken.com', NOW(), 3, 10.5, 2);"
      );
    });

    it('TC-304-1 - When a meal that does not exist is requested, a valid error should be returned', (done) => {
      console.log(token)
      chai
      .request(server)
      .get('/api/meal/3')
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, message} = res.body;
        statusCode.should.equals(404);
        message.should.be.a('string').that.equals('Meal with ID 3 not found')
        done();
      })
    });

    it('TC-304-2 - When a meal is successfully requested, a valid response should be returned', (done) => {
      console.log(token)
      chai
      .request(server)
      .get('/api/meal/1')
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, result} = res.body;
        statusCode.should.equals(200);
        result.should.be.an('object').that.has.all.keys("id", "name", "description", "isActive", "isVega", "isVegan", "isToTakeHome", 
        "imageUrl", "dateTime", "maxAmountOfParticipants", "price", "cookId", "allergenes", "createDate", "updateDate")
        done();
      })
    });
  });

  describe('UC-305 - Delete a single meal /api/meal', () => {
    beforeEach(async () => {
      const promisePool = dbconnection.promise();
      await promisePool.query("DELETE IGNORE FROM meal_participants_user");
      await promisePool.query("DELETE IGNORE FROM  meal");
      await promisePool.query("DELETE IGNORE FROM  user");
      await promisePool.query(
        'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
        '(1, "John", "Doe", "john.doe@mail.com", "secret", "Lovensdijkstraat 73", "Breda"),' +
        '(2, "Lucas", "Kleijn", "lucas.kleijn@mail.com", "password", "Hogeschoollaan 91", "Breda");'
      );
      await promisePool.query(
        'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
        "(1, 'Fries', 'Fries with a side of salad', 'www.fries.com', NOW(), 5, 6.50, 1)," +
        "(2, 'Fried chicken', 'Some fried chicken for your delight.', 'www.chicken.com', NOW(), 3, 10.5, 2);"
      );
    });

    it('TC-305-1 - When a user is not logged in but tries to delete a meal, a valid error should be returned', (done) => {
      console.log(token)
      chai
      .request(server)
      .delete('/api/meal/1')
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, message} = res.body;
        statusCode.should.equals(401);
        message.should.be.a('string').that.equals('Authorization header missing')
        done();
      })
    });

    it('TC-305-2 - When a user tries to delete a meal that is not theirs, a valid error should be returned', (done) => {
      console.log(token)
      chai
      .request(server)
      .delete('/api/meal/2')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, message} = res.body;
        statusCode.should.equals(403);
        message.should.be.a('string').that.equals('You need to be the owner of a meal to delete it')
        done();
      })
    });

    it('TC-305-3 - When a user tries to delete a meal that does not exist, a valid error should be returned', (done) => {
      console.log(token)
      chai
      .request(server)
      .delete('/api/meal/3')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, message} = res.body;
        statusCode.should.equals(400);
        message.should.be.a('string').that.equals('Meal with ID 3 not found')
        done();
      })
    });

    it('TC-305-4 - When a user successfully deletes a meal, a valid response should be returned', (done) => {
      console.log(token)
      chai
      .request(server)
      .delete('/api/meal/1')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {statusCode, message} = res.body;
        statusCode.should.equals(200);
        message.should.be.a('string').that.equals('Meal with ID 1 successfully deleted')
        done();
      })
    });
  });
});