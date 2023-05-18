// process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareameal-testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const pool = require('../../src/util/sql.database')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../../src/util/utils').jwtSecretKey

chai.should()
chai.use(chaiHttp)

const CLEAR_USER = 'DELETE IGNORE FROM `user`;'
const CLEAR_MEAL = 'DELETE IGNORE FROM `meal`;'
const CLEAR_DB = CLEAR_USER + CLEAR_MEAL

describe('TC-20x user', () => {
    before((done) => {
        pool.getConnection((err, conn) => {
            if (conn) {
                conn.query(CLEAR_DB, (err, results, fields) => {})

                // conn.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAddress`, `password`, `phoneNumber`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [ 100, 'John', 'Doe', 'j.doe@avans.nl', 'Secret123', '06 12345678', 'street', 'city' ], () => {})
            }
            conn.release()
        })
        done()
    })

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
                password: 'Secret123'
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(400)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        describe('TC-201-2-x Invalid emailAddress', () => {
            it('TC-201-2-1 No prefix', (done) => {
                chai
                .request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAddress: '@server.com',
                    password: 'Secret123'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(400)
                    res.body.should.have.property('message')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
                it('TC-201-2-1 No domain', (done) => {
                    chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        firstName: 'John',
                        lastName: 'Doe',
                        street: 'Lovensdijkstraat 61',
                        city: 'Breda',
                        emailAddress: 'j.doe@.com',
                        password: 'Secret123'
                    })
                    .end((err, res) => {
                        res.body.should.be.an('object')
                        res.body.should.have.property('status').to.be.equal(400)
                        res.body.should.have.property('message')
                        res.body.message.should.be.a('string')
                        res.body.should.have.property('data').to.be.empty
                        done()
                    })
                })
                it('TC-201-2-1 No suffix', (done) => {
                    chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        firstName: 'John',
                        lastName: 'Doe',
                        street: 'Lovensdijkstraat 61',
                        city: 'Breda',
                        emailAddress: 'j.doe@server',
                        password: 'Secret123'
                    })
                    .end((err, res) => {
                        res.body.should.be.an('object')
                        res.body.should.have.property('status').to.be.equal(400)
                        res.body.should.have.property('message')
                        res.body.message.should.be.a('string')
                        res.body.should.have.property('data').to.be.empty
                        done()
                    })
                })
            })
        })
        it('TC-201-3 Invalid password ', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                street: 'Lovensdijkstraat 61',
                city: 'Breda',
                emailAddress: 'j.doe@server.com',
                password: 'secre'
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(400)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
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
                    password: 'Secret123',
                    phoneNumber: '06 12345678'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(201)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                let { id, firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data
                id.should.be.a('number')
                firstName.should.be.a('string').to.be.equal('John')
                lastName.should.be.a('string').to.be.equal('Doe')
                street.should.be.a('string').to.be.equal('Lovensdijkstraat 61')
                city.should.be.a('string').to.be.equal('Breda')
                isActive.should.be.a('boolean').to.be.equal(true)
                emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                password.should.be.a('string').to.be.equal('Secret123')
                phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                done()
            })
        })
        it('TC-201-4 User already exists', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                street: 'Lovensdijkstraat 61',
                city: 'Breda',
                emailAddress: 'j.doe@server.com',
                password: 'Secret123',
                phoneNumber: '06 12345678'
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(403)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
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
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                res.body.data.should.be.an('Array')
                done()
            })
        })
        it('TC-202-2 Show all users on not existing fields', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .send({
                gender: 'male'
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                done()
            })
        })
        it('TC-202-1 Show all users that are inactive', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .send({
                isActive: false
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                res.body.data.should.be.an('Array')
                done()
            })
        })
        it('TC-202-1 Show all users that are active', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .send({
                isActive: true
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                res.body.data.should.be.an('Array')
                done()
            })
        })
    })
    describe('TC-203 Get user info', () => {
        it('TC-203-1 User is not logged in with valid token', (done) => {
            let token = 'sljdkfajlsejflksdlkfjasdlkf'

            chai
            .request(server)
            .get('/api/user/profile')
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(401)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-203-2 User has logged in with valid token', (done) => {
            let token = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })
            chai
            .request(server)
            .get('/api/user/profile')
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber, password } = res.body.data
                id.should.be.a('number')
                firstName.should.be.a('string')
                lastName.should.be.a('string')
                street.should.be.a('string')
                city.should.be.a('string')
                isActive.should.be.a('boolean')
                emailAddress.should.be.a('string')
                phoneNumber.should.be.a('string')
                password.should.be.a('string')
                done()
            })
        })
    })
    describe('TC-204 Get user details by id', () => {
        it('TC-204-2 User does not exist', (done) => {
            chai
            .request(server)
            .get('/api/user/10000')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(404)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-204-3 User exists', (done) => {
            chai
            .request(server)
            .get('/api/user/2')
            .send(
                {
                    
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                let { id, firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data
                id.should.be.a('number')
                firstName.should.be.a('string')
                lastName.should.be.a('string')
                street.should.be.a('string')
                city.should.be.a('string')
                isActive.should.be.a('number')
                emailAddress.should.be.a('string')
                password.should.be.a('string')
                phoneNumber.should.be.a('string')
                done()
            })
        })
    })
    describe('TC-205 Update user by id', () => {
        it('TC-205-1 EmailAddress is missing', (done) => {
            chai
            .request(server)
            .put('/api/user/1')
            .send(
                {
                    password: 'moreSecret123'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(400)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-205-3 Invalid phoneNumber', (done) => {
            chai
            .request(server)
            .put('/api/user/1')
            .send(
                {
                    emailAddress: 'j.doe@server.com',
                    phoneNumber: '06 1B3D5E7G'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(400)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-205-4 User does not exist', (done) => {
            chai
            .request(server)
            .put('/api/user/10000')
            .send(
                {
                    emailAddress: 'j.doe@server.com',
                    password: 'moreSecret123'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(404)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
    })
    describe('TC-206 Delete user by id', () => {
        it('TC-206-1 User does not exist', (done) => {
            chai
            .request(server)
            .delete('/api/user/10000')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(404)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it.skip('TC-206-4 User is deleted succesfully', (done) => {
            chai
            .request(server)
            .delete('/api/user/2')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
    })
})
