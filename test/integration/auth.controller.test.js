process.env.DB_DATABASE = process.env.DB_DATABASE || 'share_a_meal_testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')

chai.should()
chai.use(chaiHttp)

const CLEAR_DB =
  'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`;'

const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "john.doe@mail.com", "secret", "Lovensdijkstraat 73", "Breda");'

//This line removes console.log, so that you can see the list of tests more easily.
console.log = function() {};

describe('Login', () => {
  before((done) => {
    console.log('before: hier zorg je eventueel dat de precondities correct zijn')
    console.log('before done')
    done()
  })

  describe('UC-101 - Login /api/auth/login', () => {
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

    it('TC-101-1 - When a required input is missing, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/auth/login')
      .send({
        //Email adress is missing
        "password": "secret",
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Email adress must be a string');
        done();
      })
    });

    it('TC-101-2 - When an invalid email is input, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/auth/login')
      .send({
        //Email adress is invalid, it's missing a .com
        "emailAdress": "john.doe@mail",
        "password": "secret"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Email adress must be valid');
        done();
      })
    });

    it('TC-101-3 - When an invalid password is input, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/auth/login')
      .send({
        "emailAdress": "john.doe@mail.com",
        //Password is invalid, it's shorter than 4 characters
        "password": "sec"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Password must be valid');
        done();
      })
    });

    it('TC-101-4 - When a user does not exist, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/auth/login')
      .send({
        //Johnny isn't tied to a user
        "emailAdress": "johnny.doe@mail.com",
        "password": "secret"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(404);
        result.should.be.a('string').that.equals('Email not found');
        done();
      })
    });

    it('TC-101-5 - When a user is successfully logged in, a valid response should be returned', (done) => {
      chai
      .request(server)
      .post('/api/auth/login')
      .send({
        "emailAdress": "john.doe@mail.com",
        "password": "secret"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(200);
        result.should.be.an('object')
        done();
      })
    });
  });
});