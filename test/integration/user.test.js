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
const CLEAR_PARTICIPANTS = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_DB = CLEAR_USER + CLEAR_MEAL + CLEAR_PARTICIPANTS

let token2
let token3

describe('TC-20x user', function () {
    this.timeout(3000)

    before((done) => {
        pool.getConnection((err, conn) => {
            if (conn) {
                conn.query(CLEAR_DB, (err, results, fields) => {})

                conn.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAddress`, `password`, `phoneNumber`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [ 2, 'John', 'Doe', 'j.doe@server.com', 'Secret123', '06 12345678', 'street', 'city' ], () => {})
                conn.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAddress`, `password`, `phoneNumber`, `street`, `city`, `isActive`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [ 3, 'John', 'Joe', 'j.joe@server.com', 'Secret123', '06 12345678', 'street', 'city', false ], () => {})
            }
            pool.releaseConnection(conn)
        })

        // Set tokens
        token2 = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })
        token3 = jwt.sign({ userId: 3 }, jwtSecretKey, { expiresIn: '2d' })

        setTimeout(() => {
            done()
        }, 2000)
    })
    
    
    describe('TC-202 Retrieve users', () => {
        it('TC-202-1 Show all users (minimum of two)', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('Users successfully retrieved')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                res.body.data.should.be.an('Array')
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data[0]
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                }
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data[1]
                    id.should.be.a('number').to.be.equal(3)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Joe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(false)
                    emailAddress.should.be.a('string').to.be.equal('j.joe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                }
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
                res.body.should.have.property('message').to.be.equal('Users successfully retrieved')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                res.body.data.should.be.an('Array')
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data[0]
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                }
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data[1]
                    id.should.be.a('number').to.be.equal(3)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Joe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(false)
                    emailAddress.should.be.a('string').to.be.equal('j.joe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                }
                done()
            })
        })
        it('TC-202-3 Show all users that are inactive', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .send({
                isActive: false
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('Users successfully retrieved')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                res.body.data.should.be.an('Array')
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data[1]
                    id.should.be.a('number').to.be.equal(3)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Joe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(false)
                    emailAddress.should.be.a('string').to.be.equal('j.joe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                }
                done()
            })
        })
        it('TC-202-4 Show all users that are active', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .send({
                isActive: true
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('Users successfully retrieved')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                res.body.data.should.be.an('Array')
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data[0]
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                }
                done()
            })
        })
        it('TC-202-5 Show all users on existing fields', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .send({
                street: 'street'
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('Users successfully retrieved')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                res.body.data.should.be.an('Array')
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data[0]
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                }
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data[1]
                    id.should.be.a('number').to.be.equal(3)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Joe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(false)
                    emailAddress.should.be.a('string').to.be.equal('j.joe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                }
                done()
            })
        })
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
                res.body.should.have.property('message').to.be.equal('AssertionError [ERR_ASSERTION]: phoneNumber must be a string')
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
                    phoneNumber: '06 12345678',
                    password: 'Secret123'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(400)
                    res.body.should.have.property('message').to.be.equal('Error: EmailAddress is not valid')
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
                        res.body.should.have.property('message').to.be.equal('AssertionError [ERR_ASSERTION]: emailAddress must be a string')
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
                        res.body.should.have.property('message').to.be.equal('AssertionError [ERR_ASSERTION]: emailAddress must be a string')
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
                phoneNumber: '06 12345678',
                password: 'secre'
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(400)
                res.body.should.have.property('message').to.be.equal('Error: Password does not meet the minimum requirements')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-201-4 User already exists', (done) => {
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
                res.body.should.have.property('status').to.be.equal(403)
                res.body.should.have.property('message').to.be.equal('EmailAddress is already in use')
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
                    lastName: 'Roe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAddress: 'j.roe@server.com',
                    password: 'Secret123',
                    phoneNumber: '06 12345678'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(201)
                res.body.should.have.property('message').to.be.equal('User with id 4 successfully added')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                let { id, firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data
                id.should.be.a('number').to.be.equal(4)
                firstName.should.be.a('string').to.be.equal('John')
                lastName.should.be.a('string').to.be.equal('Roe')
                street.should.be.a('string').to.be.equal('Lovensdijkstraat 61')
                city.should.be.a('string').to.be.equal('Breda')
                isActive.should.be.a('boolean').to.be.equal(true)
                emailAddress.should.be.a('string').to.be.equal('j.roe@server.com')
                password.should.be.a('string').to.be.equal('Secret123')
                phoneNumber.should.be.a('string').to.be.equal('06 12345678')
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
                res.body.should.have.property('message').to.be.equal('Not authorised')
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
                res.body.should.have.property('message').to.be.equal('User 2 successfully retrieved')
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
        it('TC-204-1 Invalid token', (done) => {
            chai
            .request(server)
            .get('/api/user/2')
            .set({ Authorization: `Bearer ${token3}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(401)
                res.body.should.have.property('message').to.be.equal('Not authorised')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-204-2 User does not exist', (done) => {
            chai
            .request(server)
            .get('/api/user/10000')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(404)
                res.body.should.have.property('message').to.be.equal('User with id 10000 has not been found')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        describe('TC-204-3 User exists', () => {
            it('TC-204-3 Without token', (done) => {
                chai
                .request(server)
                .get('/api/user/2')
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(200)
                    res.body.should.have.property('message').to.be.equal('User with id 2 has been found')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.not.be.empty
                    let { id, firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                    done()
                })
            })
            it('TC-204-3 With token', (done) => {
                chai
                .request(server)
                .get('/api/user/2')
                .set({ Authorization: `Bearer ${token2}` })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(200)
                    res.body.should.have.property('message').to.be.equal('User with id 2 has been found')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.not.be.empty
                    let { id, firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    password.should.be.a('string').to.be.equal('Secret123')
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                    done()
                })
            })
        })
    })
    describe('TC-205 Update user by id', () => {
        it('TC-205-1 EmailAddress is missing', (done) => {
            chai
            .request(server)
            .put('/api/user/2')
            .set({ Authorization: `Bearer ${token2}` })
            .send(
                {
                    password: 'moreSecret123'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(400)
                res.body.should.have.property('message').to.be.equal('The required parameter emailAddress is missing')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-205-2 User is not the owner of the data', (done) => {
            chai
            .request(server)
            .put('/api/user/2')
            .set({ Authorization: `Bearer ${token3}` })
            .send(
                {
                    emailAddress: 'j.doe@server.com',
                    phoneNumber: '06 12345678'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(403)
                res.body.should.have.property('message').to.be.equal('Not authorised')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-205-3 Invalid phoneNumber', (done) => {
            chai
            .request(server)
            .put('/api/user/2')
            .set({ Authorization: `Bearer ${token2}` })
            .send(
                {
                    emailAddress: 'j.doe@server.com',
                    phoneNumber: '06 1B3D5E7G'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(400)
                res.body.should.have.property('message').to.be.equal('Error: Phonenumber is not formatted correctly')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-205-4 User does not exist', (done) => {
            chai
            .request(server)
            .put('/api/user/10000')
            .set({ Authorization: `Bearer ${token2}` })
            .send(
                {
                    emailAddress: 'j.doe@server.com',
                    password: 'moreSecret123'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(404)
                res.body.should.have.property('message').to.be.equal('User with id 10000 has not been found')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        describe('TC-205-5 User is not logged in', () => {
            it('TC-205-5 Invalid token', (done) => {
                chai
                .request(server)
                .put('/api/user/2')
                .set({ Authorization: `Bearer asdflkasjlkdfkjelkfs` })
                .send(
                    {
                        emailAddress: 'j.doe@server.com',
                        phoneNumber: '06 12345678'
                    }
                )
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(401)
                    res.body.should.have.property('message').to.be.equal('Not authorised')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
            it('TC-205-5 Token missing', (done) => {
                chai
                .request(server)
                .put('/api/user/2')
                .send(
                    {
                        emailAddress: 'j.doe@server.com',
                        phoneNumber: '06 12345678'
                    }
                )
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(401)
                    res.body.should.have.property('message').to.be.equal('Authorization header missing')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
        })
        it('TC-205-6 User edited successfully', (done) => {
            chai
            .request(server)
            .put('/api/user/2')
            .set({ Authorization: `Bearer ${token2}` })
            .send(
                {
                    emailAddress: 'j.doe@server.com',
                    phoneNumber: '06 87654321'
                }
            )
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('User with id 2 has been edited succesfully')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                {
                    let { id, firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    password.should.be.a('string').to.be.equal('Secret123')
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 87654321')
                }
                done()
            })
        })
    })
    describe('TC-206 Delete user by id', () => {
        it('TC-206-1 User does not exist', (done) => {
            chai
            .request(server)
            .delete('/api/user/10000')
            .set({ Authorization: `Bearer ${token2}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(404)
                res.body.should.have.property('message').to.be.equal('User with id 10000 has not been found')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-206-2 User is not logged in', (done) => {
            chai
            .request(server)
            .delete('/api/user/2')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(401)
                res.body.should.have.property('message').to.be.equal('Authorization header missing')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-206-3 User is not the owner of this data', (done) => {
            chai
            .request(server)
            .delete('/api/user/2')
            .set({ Authorization: `Bearer ${token3}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(403)
                res.body.should.have.property('message').to.be.equal('Not authorised')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-206-4 User is deleted succesfully', (done) => {
            chai
            .request(server)
            .delete('/api/user/2')
            .set({ Authorization: `Bearer ${token2}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('User with id 2 has been deleted')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
    })

    after((done) => {
        pool.getConnection((err, conn) => {
            if (conn) {
                conn.query(CLEAR_DB, (err, results, fields) => {})
            }
            pool.releaseConnection(conn)
        })
        done()
    })
})
