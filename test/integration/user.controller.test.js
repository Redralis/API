const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

chai.should();
chai.use(chaiHttp);

console.log = function() {};

describe('Manage users', () => {
  describe('UC-201 - Register as a new user /api/user', () => {
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
        "emailAdress": "john.doe@mail.com"
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
        "firstName": "John",
        "lastName": "Doe",
        "street": "Hogeschoollaan 61",
        "city": "Breda",
        "password": "secret",
        "emailAdress": 0
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Email adress must be a string');
        done();
      })
    });

    it('TC-201-3 - When and invalid password is input, a valid error should be returned', (done) => {
      chai
      .request(server)
      .post('/api/user')
      .send({
        "firstName": "John",
        "lastName": "Doe",
        "street": "Hogeschoollaan 61",
        "city": "Breda",
        "password": 0,
        "emailAdress": "john.doe@mail.com"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(400);
        result.should.be.a('string').that.equals('Password must be a string');
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
        "emailAdress": "john.doe@mail.com"
      })
      .send({
        "firstName": "John",
        "lastName": "Doe",
        "street": "Hogeschoollaan 61",
        "city": "Breda",
        "password": "secret",
        "emailAdress": "john.doe@mail.com"
      })
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(422);
        result.should.be.a('string').that.equals('Email address is already registered');
        done();
      })
    });
  });

  describe('UC-202 - Show all users /api/user', () => {
    it('TC-202-1 - When a request is sent, a response containing all users should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user')
      .end((err, res) => {
        res.should.be.an('object');
        let {status} = res.body;
        status.should.equals(200);
        done();
      })
    });
  });

  describe('UC-204 - Show a single user /api/user/{ID}', () => {
    it('TC-204-2 - When an id that is not tied to a user is passed to the request, a valid error should be returned', (done) => {
      chai
      .request(server)
      //User id 0 does not and cannot exist in the database.
      .get('/api/user/0')
      .end((err, res) => {
        res.should.be.an('object');
        let {status, result} = res.body;
        status.should.equals(404);
        result.should.be.a('string').that.equals('User with ID 0 not found');
        done();
      })
    });

    it('TC-204-3 - When a user is successfully requested, a valid error should be returned', (done) => {
      chai
      .request(server)
      .get('/api/user/1')
      .end((err, res) => {
        res.should.be.an('object');
        let {status} = res.body;
        status.should.equals(200);
        done();
      })
    });
  });

  describe('UC-205 - Edit users /api/user/{ID}', () => {
    it('TC-205-1 - When a required input is missing, a valid error should be returned', (done) => {
      chai
      .request(server)
      .put('/api/user/1')
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
      .send({
        "id": 1,
        "firstName": "Lucas",
        "lastName": "de Kleijn",
        "street": "Hogeschoollaan 91",
        "city": "Breda",
        "isActive": false,
        "password": "secret",
        "emailAdress": "lucas.dekleijn@mail.com",
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
        status.should.equals(404);
        result.should.be.a('string').that.equals('User with ID 0 not found');
        done();
      })
    });

    it('TC-205-6 - When a user is successfully updated, a valid response should be returned', (done) => {
      chai
      .request(server)
      .put('/api/user/1')
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

    describe('UC-206 - Delete users /api/user/{ID}', () => {
      it('TC-206-1 - When an id that is not tied to a user is passed to the request, a valid error should be returned', (done) => {
        chai
        .request(server)
        //User id 0 does not and cannot exist in the database.
        .delete('/api/user/0')
        .end((err, res) => {
          res.should.be.an('object');
          let {status, result} = res.body;
          status.should.equals(404);
          result.should.be.a('string').that.equals('User with ID 0 not found');
          done();
        })
      });
    });

  });
});