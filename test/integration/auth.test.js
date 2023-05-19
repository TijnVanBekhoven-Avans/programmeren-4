const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const pool = require('../../src/util/sql.database')

const CLEAR_USER = 'DELETE IGNORE FROM `user`;'
const CLEAR_MEAL = 'DELETE IGNORE FROM `meal`;'
const CLEAR_DB = CLEAR_USER + CLEAR_MEAL

describe.skip('TC-101-x Login', () => {
    before((done) => {
        pool.getConnection((err, conn) => {
            if (conn) {
                conn.query(CLEAR_DB, (err, results, fields) => {})

                conn.query('INSERT INTO `user` (`firstName`, `lastName`, `emailAddress`, `password`, `phoneNumber`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?)', [ 'John', 'Doe', 'j.doe@server.com', 'Secret123', '06 12345678', 'street', 'city' ] , (err, results, fields) => {})
            }
            conn.release()
        })
        done()
    })

    describe('TC-101-1-x Required field is missing', () => {
        it('TC-101-1-1 Password is missing', (done) => {
            chai
            .request(server)
            .post('/api/login')
            .send({
                emailAddress: 'j.doe@server.com'
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
        it('TC-101-1-1 EmailAddress is missing', (done) => {
            chai
            .request(server)
            .post('/api/login')
            .send({
                password: "Secret123"
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
    describe('TC-101-2-x Invalid password', () => {
        it('TC-101-2-1 No numbers', (done) => {
            chai
            .request(server)
            .post('/api/login')
            .send({
                emailAddress: 'j.doe@server.com',
                password: 'MoreSecret'
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
        it('TC-101-2-1 No uppercase letters', (done) => {
            chai
            .request(server)
            .post('/api/login')
            .send({
                emailAddress: 'j.doe@server.com',
                password: 'secret123'
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
        it('TC-101-2-1 No lowercase letter', (done) => {
            chai
            .request(server)
            .post('/api/login')
            .send({
                emailAddress: 'j.doe@server.com',
                password: 'SECRET123'
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
        it('TC-101-2-1 Not long enough', (done) => {
            chai
            .request(server)
            .post('/api/login')
            .send({
                emailAddress: 'j.doe@server.com',
                password: 'Secret1'
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
    it('TC-101-3 User does not exist', (done) => {
        chai
        .request(server)
        .post('/api/login')
        .send({
            emailAddress: 'n.sdfsadfefs@dfsdfe.com',
            password: 'Secret123'
        })
        .end((err, res) => {
            res.body.should.be.an('object')
            res.body.should.have.property('status').to.be.equal(404)
            res.body.should.have.property('message')
            res.body.message.should.be.a('string')
            res.body.should.have.property('data').to.be.empty
            done()
        })
    })
    it('TC-101-4 User has logged in succesfully', (done) => {
        chai
        .request(server)
        .post('/api/login')
        .send({
            emailAddress: 'j.doe@server.com',
            password: 'Secret123'
        })
        .end((err, res) => {
            res.body.should.be.an('object')
            res.body.should.have.property('status').to.be.equal(200)
            res.body.should.have.property('message')
            res.body.message.should.be.a('string')
            res.body.should.have.property('data').to.not.be.empty
            let { id, firstName, lastName, isActive, emailAddress, password, phoneNumber, street, city, token } = res.body.data
            id.should.be.a('number')
            firstName.should.be.a('string')
            lastName.should.be.a('string')
            isActive.should.be.a('boolean')
            emailAddress.should.be.a('string')
            password.should.be.a('string')
            phoneNumber.should.be.a('string')
            street.should.be.a('string')
            city.should.be.a('string')
            token.should.be.a('string')
            done()
        })
    })
})