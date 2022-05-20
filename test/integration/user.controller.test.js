process.env.DB_DATABASE = process.env.DB_DATABASE || 'share_a_meal_testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')
const { expect } = require('chai')
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY1MzA0NzYyMywiZXhwIjoxNjUzNjUyNDIzfQ.gdnFQWZX7V4oZ1doiAcLpkHNPlED9IY5opQsghOkilc"

chai.should()
chai.use(chaiHttp)

const CLEAR_DB =
  'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`;'

const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "john.doe@mail.com", "secret", "Lovensdijkstraat 73", "Breda"),' +
  '(2, "Lucas", "Kleijn", "lucas.kleijn@mail.com", "password", "Hogeschoollaan 91", "Breda");'

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

  describe('UC-202 - Show users /api/user', () => {
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

    it('TC-202-1 - When a request which requests 0 users is sent, a response containing 0 users should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user?amount=0')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(200);
        expect(results).to.have.lengthOf(0);
        done();
      })
    });

    it('TC-202-2 - When a request which requests 2 users is sent, a response containing 2 users should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user?amount=2')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(200);
        expect(results).to.have.lengthOf(2);
        done();
      })
    });

    it('TC-202-3 - When a request which searches for a nonexistant firstName is sent, a response containing 0 users should be returned', (done) => {
      chai
      .request(server)
      //There is no user with firstName "NonExistantFirstName"
      .get('/api/user?firstName=NonExistantFirstName')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(200);
        expect(results).to.have.lengthOf(0);
        done();
      })
    });

    it('TC-202-4 - When a request which searches for a inactive users is sent, a response containing only inactive users should be returned', (done) => {
      chai
      .request(server)
      //0 = inactive, since both inserted test users are active 0 users should be returned.
      .get('/api/user?isActive=0')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(200);
        expect(results).to.have.lengthOf(0);
        done();
      })
    });

    it('TC-202-5 - When a request which searches for a active users is sent, a response containing only active users should be returned', (done) => {
      chai
      .request(server)
      //1 = inactive, since both inserted test users are active 2 users should be returned.
      .get('/api/user?isActive=1')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(200);
        expect(results).to.have.lengthOf(2);
        done();
      })
    });

    it('TC-202-6 - When a request which searches for an existant firstName is sent, a response containing matching users should be returned', (done) => {
      chai
      .request(server)
      //There is 1 user with firstName = Lucas
      .get('/api/user?firstName=Lucas')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(200);
        expect(results).to.have.lengthOf(1);
        done();
      })
    });

  });

  describe('UC-203 - Request user profile /api/user/profile', () => {
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

    it('TC-203-1 - When a request for a personal profile is sent without a valid token, a valid error should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user/profile')
      //ThisIsNotAToken is not a valid token.
      .set('Authorization', `Bearer ThisIsNotAToken`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(401);
        result.should.be.a('string').that.equals('Not authorized')
        done();
      })
    });

    it('TC-203-2 - When a request for a personal profile is sent with a valid token, a valid response should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user/profile')
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

    it('TC-204-1 - When a request for a specific profile is sent without a valid token, a valid error should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user/1')
      //ThisIsNotAToken is not a valid token.
      .set('Authorization', `Bearer ThisIsNotAToken`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(401);
        result.should.be.a('string').that.equals('Not authorized')
        done();
      })
    });

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
        "street": "Street",
        "city": "Breda",
        "isActive": false,
        "password": "secret",
        //Email address is missing
        "phoneNumber": "0612425475"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Email adress must be a string');
        done();
      })
    });

    it('TC-205-2 - When an invalid phone number is input, a valid error should be returned', (done) => {
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
        //Phone number is too short.
        "phoneNumber": "123456789"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Phone number must be valid');
        done();
      })
    });

    it('TC-205-3 - When an id that is not tied to a user is passed to the request, a valid error should be returned', (done) => {
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
        "phoneNumber": "0612425475"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('User with ID 0 not found');
        done();
      })
    });

    it('TC-205-4 - When a user that is not logged in tries to update a profile, a valid error should be returned', (done) => {
      chai
      .request(server)
      //No token is present meaning user is not logged in.
      .put('/api/user/2')
      .set('Authorization', `Bearer `)
      .send({
        "id": 2,
        "firstName": "Lucas",
        "lastName": "de Kleijn",
        "street": "Hogeschoollaan 91",
        "city": "Breda",
        "isActive": false,
        "password": "secret",
        "emailAdress": "lucas.dekleijn@mail.com",
        "phoneNumber": "0612425475"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(401);
        result.should.be.a('string').that.equals('Not authorized');
        done();
      })
    });

    it('TC-205-5 - When a user is successfully updated, a valid response should be returned', (done) => {
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
        "phoneNumber": "0612425475",
        "roles": "",
        "street": "",
        "city": ""
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(200);
        results.should.be.a('string').that.equals('User with ID 1 successfully updated')
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

    it('TC-206-2 - When a user who is not logged in tries to delete a profile, a valid error should be returned', (done) => {
      chai
      .request(server)
      .delete('/api/user/2')
      //No token is present meaning user is not logged in.
      .set('Authorization', `Bearer `)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(401);
        result.should.be.a('string').that.equals('Not authorized');
        done();
      })
    });

    it('TC-206-3 - When a user tries to delete a profile that is not theirs, a valid error should be returned', (done) => {
      chai
      .request(server)
      .delete('/api/user/2')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.be.an('object');
        let {status, results} = res.body;
        status.should.equals(401);
        results.should.be.a('string').that.equals('You need to be logged in to delete your profile');
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