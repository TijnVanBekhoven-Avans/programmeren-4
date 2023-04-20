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
})