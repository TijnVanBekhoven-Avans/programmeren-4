const assert = require('assert')
const jwt = require('jsonwebtoken')
const pool = require('../util/sql.database')
const jwtSecretKey = require('../util/utils').jwtSecretKey
const validate = require('../util/validation')

const authController = {
    login: (req, res, next) => {
        try {
            let { emailAddress, password } = req.body

            assert(typeof emailAddress === 'string', 'emailAddress must be a string')
            assert(typeof password === 'string', 'password must be a string')

            if (!validate.emailAddress(emailAddress)) {
                throw new Error('EmailAddress is not valid')
            }
            if (!validate.password(password)) {
                throw new Error('Password is not valid')
            }

            pool.getConnection((err, conn) => {
                if (err) {
                    console.log(`Error: ${err.message}`)
                }
                if (conn) {
                    conn.execute(
                        'SELECT * FROM `user` WHERE `EmailAddress` LIKE ?',
                        [ emailAddress ],
                        async (err, results, fields) => {
                            if (err) {
                                console.log(`Error: ${err.message}`)
                            }
                            if (results) {
                                if (results.length > 0 && results[0].password === password) {
                                    const payload = {
                                        userId: results[0].id
                                    }
                                
                                    jwt.sign(
                                        payload,
                                        jwtSecretKey,
                                        { expiresIn: '2d' },
                                        (err, token) => {
                                            let user = results[0]
                                            user.token = token

                                            if (user.isActive === 1) {
                                                user.isActive = true;
                                            } else if (user.isActive === 0) {
                                                user.isActive = false;
                                            }

                                            res.status(200).json(
                                                {
                                                    status: 200,
                                                    message: "User has been found",
                                                    data: user
                                                }
                                            )
                                        }
                                    )
                                } else {
                                    res.status(404).json(
                                        {
                                            status: 404,
                                            message: "Not authorized",
                                            data: {}
                                        }
                                    )
                                }
                            } 
                        }
                    )
                    pool.releaseConnection(conn)
                }
            })
        } catch (err) {
            res.status(400).json(
                {
                    status: 400,
                    message: err.toString(),
                    data: {}
                }
            )
        }
    },

    validateToken: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            next(
                {
                    code: 401,
                    message: 'Authorization header missing'
                }
            )
        } else {
            // Strip the word 'Bearer ' from the token
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    next(
                        {
                            code: 401,
                            message: 'Not authorised'
                        }
                    )
                }
                if (payload) {
                    pool.getConnection((err, conn) => {
                        conn.execute(
                            'SELECT * FROM `user` WHERE `id` = ?',
                            [ payload.userId ],
                            (err, results, fields) => {
                                if (err) {
                                    next({
                                        code: 401,
                                        message: 'Not authorised'
                                    })
                                }
                                if (results && results[0]) {
                                    req.userId = payload.userId
                                    next()
                                } else {
                                    next({
                                        code: 401,
                                        message: 'Not authorised'
                                    })
                                }
                            }
                        )
                        pool.releaseConnection(conn)
                    })
                }
            })
        }
    },

    validateTokenOptional: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            next()
        } else {
            // Strip the word 'Bearer ' from the token
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    next(
                        {
                            code: 401,
                            message: 'Not authorised'
                        }
                    )
                }
                if (payload) {
                    pool.getConnection((err, conn) => {
                        conn.execute(
                            'SELECT * FROM `user` WHERE `id` = ?',
                            [ payload.userId ],
                            (err, results, fields) => {
                                if (err) {
                                    next({
                                        code: 401,
                                        message: 'Not authorised'
                                    })
                                }
                                if (results && results[0]) {
                                    req.userId = payload.userId
                                    next()
                                } else {
                                    next({
                                        code: 401,
                                        message: 'Not authorised'
                                    })
                                }
                            }
                        )
                        pool.releaseConnection(conn)
                    })
                }
            })
        }
    }
}

module.exports = authController