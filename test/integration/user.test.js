const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaiHttp)

describe('TC-20x user', () => {
    describe('TC-201 Register a new user', () => {
        it('TC-201-1 Required field is missing', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                street: 'Lovensdijkstraat 61',
                city: 'Breda',
                emailAddress: 'j.doe@server.com',
                password: 'secret'
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(400)
                res.body.should.have.property('message')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-201-5 User successfully registered', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send(
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAddress: 'j.doe@server.com',
                    password: 'secret',
                    phoneNumber: '06 12345678'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(201)
                res.body.should.have.property('message')
                res.body.should.have.property('data').to.not.be.empty
                let { id, firstName, lastName, street, city, emailAddress, password, phoneNumber } = res.body.data
                id.should.be.a('number')
                firstName.should.be.a('string').to.be.equal('John')
                lastName.should.be.a('string').to.be.equal('Doe')
                street.should.be.a('string').to.be.equal('Lovensdijkstraat 61')
                city.should.be.a('string').to.be.equal('Breda')
                emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                password.should.be.a('string').to.be.equal('secret')
                phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                done()
            })
        })
    })
    describe('TC-202 Retrieve users', () => {
        it('TC-202-1 Show all users (minimum of two)', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.should.have.property('data').to.not.be.empty
                let { users } = res.body.data
                users.should.be.an('Array')
                done()
            })
        })
    })
    describe('TC-203 Get user info', () => {
        it('TC-203-2 User has logged in with valid token', (done) => {
            chai
            .request(server)
            .get('/api/user/profile')
            .send(
                {
                    
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(501)
                res.body.should.have.property('message').to.be.equal('Functionality has yet be realised')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
    })
    describe('TC-204 Get user details by id', () => {
        it('TC-204-3 User exists', (done) => {
            chai
            .request(server)
            .get('/api/user/1')
            .send(
                {
                    
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.should.have.property('data').to.not.be.empty
                let { id, firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data
                id.should.be.a('number')
                firstName.should.be.a('string')
                lastName.should.be.a('string')
                street.should.be.a('string')
                city.should.be.a('string')
                isActive.should.be.a('boolean')
                emailAddress.should.be.a('string')
                password.should.be.a('string')
                phoneNumber.should.be.a('string')
                done()
            })
        })
    })
    describe('TC-206 Delete user by id', () => {
        it('TC-206-4 User is deleted succesfully', (done) => {
            chai
            .request(server)
            .delete('/api/user/1')
            .send(
                {
                    
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
    })
})