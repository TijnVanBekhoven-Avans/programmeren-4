const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const pool = require('../../src/util/sql.database')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../../src/util/utils').jwtSecretKey

const CLEAR_USER = 'DELETE IGNORE FROM `user`;'
const CLEAR_MEAL = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_DB = CLEAR_USER + CLEAR_MEAL + CLEAR_PARTICIPANTS

let token2
let token3

describe('TC-30x Meal', function () {
    this.timeout(3000)

    before((done) => {
        pool.getConnection((err, conn) => {
            if (conn) {
                conn.query(CLEAR_DB, (err, results, fields) => {})

                // Add users
                conn.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAddress`, `password`, `phoneNumber`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [ 2, 'John', 'Doe', 'j.doe@server.com', 'Secret123', '06 12345678', 'street', 'city' ] , (err, results, fields) => {
                    if (results) {
                        console.log('Testuser 2 has been created')
                    }
                })
                conn.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAddress`, `password`, `phoneNumber`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [ 3, 'John', 'Roe', 'j.roe@server.com', 'Secret123', '06 12345678', 'street', 'city' ] , (err, results, fields) => {
                    if (results) {
                        console.log('Testuser 3 has been created')
                    }
                })
                
                // Add meals
                conn.query('INSERT INTO `meal` (`id`, `name`, `description`, `price`, `dateTime`, `maxAmountOfParticipants`, `imageUrl`, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [ 1, 'Pizza', 'Very nice pizza', 2.50, '2023-05-19 05:40:20', 5, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/800px-Pizza-3007395.jpg', 2 ], (err, results, fields) => {
                    if (err) {
                        console.log(err.message)
                    }
                    if (results) {
                        console.log('Testmeal 1 has been created')
                    }
                })
                conn.query('INSERT INTO `meal` (`id`, `name`, `description`, `price`, `dateTime`, `maxAmountOfParticipants`, `imageUrl`, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [ 2, 'Pesto', 'Very nice pesto', 2.50, '2023-05-19 05:40:20', 5, 'https://www.eefkooktzo.nl/wp-content/uploads/2021/03/Pesto-maken.jpg', 3 ], (err, results, fields) => {
                    if (err) {
                        console.log(err.message)
                    }
                    if (results) {
                        console.log('Testmeal 2 has been created')
                    }
                })

            }
            pool.releaseConnection(conn)
        })

        // Set tokens
        token2 = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '2d' })
        token3 = jwt.sign({ userId: 3 }, jwtSecretKey, { expiresIn: '2d' })
        done()
    })

    describe('TC-301-x Create new meal', () => {
        describe('TC-301-1 Required fields is missing', () => {
            it('TC-301-1 Name is missing', (done) => {
                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token2}` })
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
                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token2}` })
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
                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token2}` })
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
                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token2}` })
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
                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token2}` })
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
                chai
                .request(server)
                .post('/api/meal')
                .set({ Authorization: `Bearer ${token2}` })
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

    describe('TC-303-x Get all meals', () => {
        it('TC-303-1 List of meals returned', (done) => {
            chai
            .request(server)
            .get('/api/meal')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('All meals have been retrieved successfully')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                let { id, name, description, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, allergenes, cook, participants } = res.body.data[0]
                id.should.be.a('number').to.be.equal(1)
                name.should.be.a('string').to.be.equal('Pizza')
                description.should.be.a('string').to.be.equal('Very nice pizza')
                isActive.should.be.a('boolean').to.be.equal(false)
                isVega.should.be.a('boolean').to.be.equal(false)
                isVegan.should.be.a('boolean').to.be.equal(false)
                isToTakeHome.should.be.a('boolean').to.be.equal(true)
                maxAmountOfParticipants.should.be.a('number').to.be.equal(5)
                price.should.be.a('number').to.be.equal(2.50)
                imageUrl.should.be.a('string').to.be.equal('https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/800px-Pizza-3007395.jpg')
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
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                }
                done()
            })
        })
    })

    describe('TC-304-x Get meal by id', () => {
        it('TC-304-1 Meal does not exist', () => {
            chai
            .request(server)
            .get('/api/meal/10000', (done) => {
                res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(404)
                    res.body.should.have.property('message').to.be.equal('Meal not found')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
            })
        })
        it('TC-304-2 Meal has been retrieved successfully', (done) => {
            chai
            .request(server)
            .get('/api/meal/1')
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('Meal has been found')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.not.be.empty
                let { id, name, description, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, allergenes, cook, participants } = res.body.data
                id.should.be.a('number').to.be.equal(1)
                name.should.be.a('string').to.be.equal('Pizza')
                description.should.be.a('string').to.be.equal('Very nice pizza')
                isActive.should.be.a('boolean').to.be.equal(false)
                isVega.should.be.a('boolean').to.be.equal(false)
                isVegan.should.be.a('boolean').to.be.equal(false)
                isToTakeHome.should.be.a('boolean').to.be.equal(true)
                maxAmountOfParticipants.should.be.a('number').to.be.equal(5)
                price.should.be.a('number').to.be.equal(2.50)
                imageUrl.should.be.a('string').to.be.equal('https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/800px-Pizza-3007395.jpg')
                allergenes.should.be.a('string').to.be.equal('')
                participants.should.be.an('Array').to.be.empty
                cook.should.be.an('object')
                {
                    let { id, firstName, lastName, isActive, emailAddress, phoneNumber, street, city } = cook
                    id.should.be.a('number').to.be.equal(2)
                    firstName.should.be.a('string').to.be.equal('John')
                    lastName.should.be.a('string').to.be.equal('Doe')
                    isActive.should.be.a('boolean').to.be.equal(true)
                    emailAddress.should.be.a('string').to.be.equal('j.doe@server.com')
                    phoneNumber.should.be.a('string').to.be.equal('06 12345678')
                    street.should.be.a('string').to.be.equal('street')
                    city.should.be.a('string').to.be.equal('city')
                }
                done()
            })
        })
    })

    describe('TC-305-x Delete meal', () => {
        describe('TC-305-1 User not logged in', () => {
            it('TC-305-1 No token included', (done) => {
                chai
                .request(server)
                .delete('/api/meal/1')
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').to.be.equal(401)
                    res.body.should.have.property('message').to.be.equal('Authorization header missing')
                    res.body.message.should.be.a('string')
                    res.body.should.have.property('data').to.be.empty
                    done()
                })
            })
            it('TC-305-1 Invalid token', (done) => {
                let token = 'sdfasdfsefasdfasdf'

                chai
                .request(server)
                .delete('/api/meal/1')
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
        })
        it('TC-305-2 Not the owner', (done) => {
            chai
            .request(server)
            .delete('/api/meal/2')
            .set({ Authorization: `Bearer ${token2}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(403)
                res.body.should.have.property('message').to.be.equal('Not authorised')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-305-3 Meal not found', (done) => {
            chai
            .request(server)
            .delete('/api/meal/10000')
            .set({ Authorization: `Bearer ${token3}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(404)
                res.body.should.have.property('message').to.be.equal('Meal not found')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
        it('TC-305-4 Meal deleted successfully', (done) => {
            chai
            .request(server)
            .delete('/api/meal/2')
            .set({ Authorization: `Bearer ${token3}` })
            .end((err, res) => {
                res.body.should.be.an('object')
                res.body.should.have.property('status').to.be.equal(200)
                res.body.should.have.property('message').to.be.equal('Meal 2 is deleted successfully')
                res.body.message.should.be.a('string')
                res.body.should.have.property('data').to.be.empty
                done()
            })
        })
    }) 
})