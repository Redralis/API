process.env.DB_DATABASE = process.env.DB_DATABASE || 'share_a_meal_testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQxLCJpYXQiOjE2NTMwNDEwODEsImV4cCI6MTY1MzY0NTg4MX0.mRZFxwY8xxvP_79jo5GG99Y8SJT4TmnLdNtlxZFVJ7A"

chai.should()
chai.use(chaiHttp)

const CLEAR_DB =
  'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`;'

const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "john.doe@mail.com", "secret", "Lovensdijkstraat 73", "Breda");'

//This line removes console.log, so that you can see the list of tests more easily.
console.log = function() {};

describe('Manage users', () => {
  before((done) => {
    console.log('before: hier zorg je eventueel dat de precondities correct zijn')
    console.log('before done')
    done()
  })

  describe('UC-201 - Register as a new user /api/user', () => {
    beforeEach((done) => {
      console.log('beforeEach called')
      //Recreating the testdatabase so the tests can be executed.
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err // not connected!
        connection.query(
            CLEAR_DB + INSERT_USER,
            function (error, results, fields) {
                // When done with the connection, release it.
                connection.release()
                // Handle error after the release.
                if (error) throw error
                console.log('beforeEach done')
                done()
            }
        )
      })
    })

    it('TC-201-1 - When a required input is missing, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/user')
      .send({
        //First name is missing
        "lastName": "Doe",
        "street": "Hogeschoollaan 61",
        "city": "Breda",
        "password": "secret",
        "emailAdress": "jane.doe@mail.com"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('First name must be a string');
        done();
      })
    });

    it('TC-201-2 - When and invalid email is input, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/user')
      .send({
        "firstName": "Jane",
        "lastName": "Doe",
        "street": "Hogeschoollaan 61",
        "city": "Breda",
        "password": "secret",
        //Email adress is invalid, it's missing a .com
        "emailAdress": "john.doe@mail"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Email adress must be valid');
        done();
      })
    });

    it('TC-201-3 - When and invalid password is input, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/user')
      .send({
        "firstName": "Jane",
        "lastName": "Doe",
        "street": "Hogeschoollaan 61",
        "city": "Breda",
        //Password is invalid, it's shorter than 4 characters
        "password": "sec",
        "emailAdress": "jane.doe@mail.com"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Password must be valid');
        done();
      })
    });

    it('TC-201-4 - When a new user already exists, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/user')
      .send({
        "firstName": "John",
        "lastName": "Doe",
        "street": "Hogeschoollaan 61",
        "city": "Breda",
        "password": "secret",
        //john.doe@mail.com is already registered
        "emailAdress": "john.doe@mail.com"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(409);
        result.should.be.a('string').that.equals('Email address is already registered');
        done();
      })
    });

    it('TC-201-5 - When a new user is successfully registered, a valid response should be returned', (done) => {
      chai
      .request(server)
      .post('/api/user')
      .send({
        "firstName": "Jane",
        "lastName": "Doe",
        "street": "Hogeschoollaan 61",
        "city": "Breda",
        "password": "secret",
        "emailAdress": "jane.doe@mail.com"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(201);
        result.should.be.an('object')
        done();
      })
    });
  });

  describe('UC-202 - Show all users /api/user', () => {
    beforeEach((done) => {
      console.log('beforeEach called')
      //Recreating the testdatabase so the tests can be executed.
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err // not connected!
        connection.query(
            CLEAR_DB + INSERT_USER,
            function (error, results, fields) {
                // When done with the connection, release it.
                connection.release()
                // Handle error after the release.
                if (error) throw error
                console.log('beforeEach done')
                done()
            }
        )
      })
    })

    it('TC-202-1 - When a request is sent, a response containing all users should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status} = res.body;
        status.should.equals(200);
        done();
      })
    });
  });

  describe('UC-204 - Show a single user /api/user/{ID}', () => {
    beforeEach((done) => {
      console.log('beforeEach called')
      //Recreating the testdatabase so the tests can be executed.
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err // not connected!
        connection.query(
            CLEAR_DB + INSERT_USER,
            function (error, results, fields) {
                // When done with the connection, release it.
                connection.release()
                // Handle error after the release.
                if (error) throw error
                console.log('beforeEach done')
                done()
            }
        )
      })
    })

    it('TC-204-2 - When an id that is not tied to a user is passed to the request, a valid error should be returned', (done) => {
      chai
      .request(server)
      //User id 0 does not and cannot exist in the database.
      .get('/api/user/0')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(404);
        result.should.be.a('string').that.equals('User with ID 0 not found');
        done();
      })
    });

    it('TC-204-3 - When a user is successfully requested, a valid response should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user/1')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status} = res.body;
        status.should.equals(200);
        done();
      })
    });
  });

  describe('UC-205 - Edit users /api/user/{ID}', () => {
    beforeEach((done) => {
      console.log('beforeEach called')
      //Recreating the testdatabase so the tests can be executed.
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err // not connected!
        connection.query(
            CLEAR_DB + INSERT_USER,
            function (error, results, fields) {
                // When done with the connection, release it.
                connection.release()
                // Handle error after the release.
                if (error) throw error
                console.log('beforeEach done')
                done()
            }
        )
      })
    })

    it('TC-205-1 - When a required input is missing, a valid error should be returned', (done) => {
      chai
      .request(server)
      .put('/api/user/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        "id": 1,
        "firstName": "Lucas",
        "lastName": "de Kleijn",
        //Street is missing
        "city": "Breda",
        "isActive": false,
        "password": "secret",
        "emailAdress": "lucas.dekleijn@mail.com",
        "phoneNumber": "06 12425475"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Street must be a string');
        done();
      })
    });

    it('TC-205-3 - When an invalid phone number is input, a valid error should be returned', (done) => {
      chai
      .request(server)
      .put('/api/user/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        "id": 1,
        "firstName": "Lucas",
        "lastName": "de Kleijn",
        "street": "Hogeschoollaan 91",
        "city": "Breda",
        "isActive": false,
        "password": "secret",
        "emailAdress": "lucas.dekleijn@mail.com",
        //Phone number should be a string
        "phoneNumber": 0
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Phone number must be a string');
        done();
      })
    });

    it('TC-205-4 - When an id that is not tied to a user is passed to the request, a valid error should be returned', (done) => {
      chai
      .request(server)
      //User id 0 does not and cannot exist in the database.
      .put('/api/user/0')
      .set('Authorization', `Bearer ${token}`)
      .send({
        "id": 1,
        "firstName": "Lucas",
        "lastName": "de Kleijn",
        "street": "Hogeschoollaan 91",
        "city": "Breda",
        "isActive": false,
        "password": "secret",
        "emailAdress": "lucas.dekleijn@mail.com",
        "phoneNumber": "06 12425475"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('User with ID 0 not found');
        done();
      })
    });

    it('TC-205-6 - When a user is successfully updated, a valid response should be returned', (done) => {
      chai
      .request(server)
      .put('/api/user/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        "id": 1,
        "firstName": "Mariëtte",
        "lastName": "van den Dullemen",
        "isActive": true,
        "emailAdress": "m.vandullemen@server.nl",
        "password": "secret",
        "phoneNumber": "",
        "roles": "",
        "street": "",
        "city": ""
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status} = res.body;
        status.should.equals(200);
        done();
      })
    });
  });

  describe('UC-206 - Delete users /api/user/{ID}', () => {
    beforeEach((done) => {
      console.log('beforeEach called')
      //Recreating the testdatabase so the tests can be executed.
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err // not connected!
        connection.query(
            CLEAR_DB + INSERT_USER,
            function (error, results, fields) {
                // When done with the connection, release it.
                connection.release()
                // Handle error after the release.
                if (error) throw error
                console.log('beforeEach done')
                done()
            }
        )
      })
    })

    it('TC-206-1 - When an id that is not tied to a user is passed to the request, a valid error should be returned', (done) => {
      chai
      .request(server)
      //User id 0 does not and cannot exist in the database.
      .delete('/api/user/0')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('User with ID 0 not found');
        done();
      })
    });

    it('TC-206-4 - When a user is successfully deleted, a valid error should be returned', (done) => {
      chai
      .request(server)
      .delete('/api/user/1')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(200);
        results.should.be.a('string').that.equals("User with ID 1 successfully deleted");
        done();
      })
    });
  });
});