const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const pool = require('../../src/util/sql.database')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../../src/util/utils').jwtSecretKey

const CLEAR_USER = 'DELETE IGNORE FROM `user`;'
const CLEAR_MEAL = 'DELETE IGNORE FROM `meal`;'
const CLEAR_DB = CLEAR_USER + CLEAR_MEAL

describe('TC-30x Meal', () => {
    before((done) => {
        pool.getConnection((err, conn) => {
            if (conn) {
                conn.query(CLEAR_DB, (err, results, fields) => {})

                conn.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAddress`, `password`, `phoneNumber`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [ 2, 'John', 'Doe', 'j.doe@server.com', 'Secret123', '06 12345678', 'street', 'city' ] , (err, results, fields) => {})
            }
            conn.release()
        })
        done()
    })

    describe('TC-301-x Create new meal', () => {
        describe('TC-301-1 Required fields is missing', () => {
            it('TC-301-1 Name is missing', (done) => {
                let token = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })

                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    description: 'Very nice pasta',
                    price: 2.50,
                    dateTime: '2023-19-05 10:25:00',
                    maxAmountOfParticipants: 5,
                    imageUrl: 'https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(400)
                    res.body.should.have.property('message').to.be.equal('name must be a string')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
            it('TC-301-1 Description is missing', (done) => {
                let token = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })

                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: 'Pasta',
                    price: 2.50,
                    dateTime: '2023-19-05 10:25:00',
                    maxAmountOfParticipants: 5,
                    imageUrl: 'https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(400)
                    res.body.should.have.property('message').to.be.equal('description must be a string')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
            it('TC-301-1 Price is missing', (done) => {
                let token = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })

                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: 'Pasta',
                    description: 'Very nice pasta',
                    dateTime: '2023-19-05 10:25:00',
                    maxAmountOfParticipants: 5,
                    imageUrl: 'https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(400)
                    res.body.should.have.property('message').to.be.equal('price must be a number')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
            it('TC-301-1 DateTime is missing', (done) => {
                let token = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })

                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: 'Pasta',
                    description: 'Very nice pasta',
                    price: 2.50,
                    maxAmountOfParticipants: 5,
                    imageUrl: 'https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(400)
                    res.body.should.have.property('message').to.be.equal('dateTime must be a string')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
            it('TC-301-1 MaxAmountOfParticipants is missing', (done) => {
                let token = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })

                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: 'Pasta',
                    description: 'Very nice pasta',
                    price: 2.50,
                    dateTime: '2023-19-05 10:25:00',
                    imageUrl: 'https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(400)
                    res.body.should.have.property('message').to.be.equal('maxAmountOfParticipants must be a number')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
            it('TC-301-1 ImageUrl is missing', (done) => {
                let token = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })

                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: 'Pasta',
                    description: 'Very nice pasta',
                    price: 2.50,
                    dateTime: '2023-19-05 10:25:00',
                    maxAmountOfParticipants: 5
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(400)
                    res.body.should.have.property('message').to.be.equal('imageUrl must be a string')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
        })
        describe('TC-301-2 User not logged in', () => {
            it('TC-301-2 No token included', (done) => {
                chai
                .request(server)
                .post('/api/meal')
                .send({
                    name: 'Pasta',
                    description: 'Very nice pasta',
                    price: 2.50,
                    dateTime: '2023-19-05 10:25:00',
                    maxAmountOfParticipants: 5,
                    imageUrl: 'https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(401)
                    res.body.should.have.property('message').to.be.equal('Authorization header missing')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
            it('TC-301-2 Invalid token', (done) => {
                let token = 'sdfasdfsefasdfasdf'

                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: 'Pasta',
                    description: 'Very nice pasta',
                    price: 2.50,
                    dateTime: '2023-19-05 10:25:00',
                    maxAmountOfParticipants: 5,
                    imageUrl: 'https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(401)
                    res.body.should.have.property('message').to.be.equal('Not authorised')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
        })
        it('TC-301-3 Meal successfully created', (done) => {
            let token = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })
            chai
            .request(server)
            .post('/api/meal')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                name: 'Pasta',
                description: 'Very nice pasta',
                price: 2.50,
                dateTime: '2023-05-19T09:40:20.352Z',
                maxAmountOfParticipants: 5,
                imageUrl: 'https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg'
            })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(201)
                res.body.should.have.property('message').to.be.equal('Meal with id 36 successfully created')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                let { id, name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cook, participants } = res.body.data
                id.should.be.a('number').to.be.equal(36)
                name.should.be.a('string').to.be.equal('Pasta')
                description.should.be.a('string').to.be.equal('Very nice pasta')
                isActive.should.be.a('boolean').to.be.equal(false)
                isVega.should.be.a('boolean').to.be.equal(false)
                isVegan.should.be.a('boolean').to.be.equal(false)
                isToTakeHome.should.be.a('boolean').to.be.equal(true)
                dateTime.should.be.a('string').to.be.equal('2023-05-19T07:40:20.000Z')
                maxAmountOfParticipants.should.be.a('number').to.be.equal(5)
                price.should.be.a('number').to.be.equal(2.50)
                imageUrl.should.be.a('string').to.be.equal('https://njam.tv/thumbnail/inline/108233/pasta-met-spicy-chorizosaus-3.jpg')
                allergenes.should.be.a('string').to.be.equal('')
                participants.should.be.an('Array').to.be.empty
                cook.should.be.an('object')
                {
                    let { id, firstName, lastName, isActive, emailAddress, password, phoneNumber, street, city } = cook
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    password.should.be.a('string').to.be.equal('Secret123')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                }
                done()
            })
        })
    })
})