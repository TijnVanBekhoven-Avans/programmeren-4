const assert = require('assert')
const jwt = require('jsonwebtoken')
const pool = require('../util/sql.database')
const { jwtSecretKey } = require('../util/utils')
const { authPlugins } = require('mysql2')

const authController = {
    login: (req, res, next) => {
        let { emailAddress, password } = req.body

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
                                        console.log('token: ' + token)

                                        let user = results[0]
                                        user.token = token

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
            }
        })
    }
}

module.exports = authController