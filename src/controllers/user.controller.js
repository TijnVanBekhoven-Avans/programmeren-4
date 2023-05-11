const assert = require('assert')
const pool = require('../util/sql.database')

const userController = {
    registerUser: (req, res, next) => {
        let newUser = req.body
        let { firstName, lastName, street, city, emailAddress, password, phoneNumber } = req.body
    
        try {
            assert(typeof firstName === 'string', 'firstName must be a string')
            assert(typeof lastName === 'string', 'lastName must be a string')
            assert(typeof street === 'string', 'street must be a string')
            assert(typeof city === 'string', 'city must be a string')
            assert(typeof emailAddress === 'string', 'emailAddress must be a string')
            assert(typeof password === 'string', 'password must be a string')
            assert(typeof phoneNumber === 'string', 'phoneNumber must be a string')
    
            if (!validateEmailAddress(emailAddress)) {
                throw new Error('EmailAddress is not valid')
            } else if (!validatePassword(password)) {
                throw new Error('Password does not meet the minimum requirements')
            } else if (!validatePhoneNumber(phoneNumber)) {
                throw new Error('PhoneNumber is not valid')
            }

            pool.getConnection( function (err, conn) {
                if (err) {
                    console.log('error', err)
                    next('error: ' + err.message)
                }
                if (conn) {
                    // Check if emailAddress is unique
                    conn.execute(
                        'SELECT * FROM `user` WHERE `emailAddress` LIKE ?',
                        [ emailAddress ],
                        function (err, results, fields) {
                            if (err) {
                                console.log(`Error: ${err.message}`)
                                next({
                                    status: 409,
                                    message: err.message
                                })
                            }
                            if (results.length > 0) {
                                res.status(403).json(
                                    {
                                        status: 403,
                                        message: 'EmailAddress is already in use',
                                        data: {}
                                    }
                                )
                            } else {
                                // Add new user to database
                                let sqlStatement = 'INSERT INTO `user` (firstName, lastName, street, city, emailAddress, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?)'
                                conn.execute(
                                    sqlStatement,
                                    [ firstName, lastName, street, city, emailAddress, password, phoneNumber ],
                                    function (err, results, fields) {
                                        if (err) {
                                            console.log(`Error: ${err.message}`)
                                            next({
                                                status: 409,
                                                message: err.message
                                            })
                                        }
                                        if (results) {  
                                            conn.execute(
                                                'SELECT * FROM `user` ORDER BY `id` DESC LIMIT 1',
                                                function (err, results, fields) {
                                                    if (err) {
                                                        console.log(`Error: ${err.message}`)
                                                        next({
                                                            status: 409,
                                                            message: err.message
                                                        })
                                                    }
                                                    if (results) {
                                                        let user = results[0]
                                                        if (user.isActive == 1) {
                                                            user.isActive = true
                                                        } else if (user.isActive == 0) {
                                                            user.isActive = false
                                                        }
                                                        res.status(201).json(
                                                            {
                                                                status: 201,
                                                                message: `User with id ${results[0].id} successfully added`,
                                                                data: user
                                                            }
                                                        )
                                                    }
                                                }
                                            )                             
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
            })
        } 
        catch (err) {
            res.status(400).json(
                {
                    status: 400,
                    message: err.toString(),
                    data: {}
                }
            )
        }
    },
    
    getAllUsers: (req, res, next) => {
        let firstNameFilter = req.query.firstName
        let lastNameFilter = req.query.lastName
        let streetFilter = req.query.street
        let cityFilter = req.query.city
        let isActiveFilter = req.query.isActive
        let emailAddressFilter = req.query.emailAddress
        let phoneNumberFilter = req.query.phoneNumber

        let sqlStatement = 'SELECT * FROM `user`'
    
        filter = []
        if (firstNameFilter) {
            filter[filter.length] = firstNameFilter
            sqlStatement = sqlStatement.concat(' WHERE `firstName` = ?')
        }
        if (lastNameFilter) {
            filter[filter.length] = lastNameFilter
            if (filter.length > 1) {
                sqlStatement = sqlStatement.concat(' AND `lastName` = ?')
            } else {
                sqlStatement = sqlStatement.concat(' WHERE `lastName` = ?')
            }
        }
        if (streetFilter) {
            filter[filter.length] = streetFilter
            if (filter.length > 1) {
                sqlStatement = sqlStatement.concat(' AND `street` = ?')
            } else {
                sqlStatement = sqlStatement.concat(' WHERE `street` = ?')
            }
        }
        if (cityFilter) {
            filter[filter.length] = cityFilter
            if (filter.length > 1) {
                sqlStatement = sqlStatement.concat(' AND `city` = ?')
            } else {
                sqlStatement = sqlStatement.concat(' WHERE `city` = ?')
            }
        }
        if (isActiveFilter) {
            filter[filter.length] = isActiveFilter
            if (filter.length > 1) {
                sqlStatement = sqlStatement.concat(' AND `isActive` = ?')
            } else {
                sqlStatement = sqlStatement.concat(' WHERE `isActive` = ?')
            }
        }
        if (emailAddressFilter) {
            filter[filter.length] = emailAddressFilter
            if (filter.length > 1) {
                sqlStatement = sqlStatement.concat(' AND `emailAddress` = ?')
            } else {
                sqlStatement = sqlStatement.concat(' WHERE `emailAddress` = ?')
            }
        }
        if (phoneNumberFilter) {
            filter[filter.length] = phoneNumberFilter
            if (filter.length > 1) {
                sqlStatement = sqlStatement.concat(' AND `phoneNumber` = ?')
            } else {
                sqlStatement = sqlStatement.concat(' WHERE `phoneNumber` = ?')
            }
        }

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error', err)
                next('error: ' + err.message)
            }
            if (conn) {
                conn.execute(sqlStatement, 
                    filter,
                    function (err, results, fields) {
                        if (err) {
                            // logger.err(err.message)
                            next({
                                status: 409,
                                message: err.message
                            })
                        }
                        if (results) {
                            // logger.info('Found', results.length, 'results')
                            res.status(200).json({
                                status: 200,
                                message: 'Users successfully retrieved',
                                data: results
                            })
                        }
                })
                pool.releaseConnection(conn)
            }
        })
    },

    getUserProfile: (req, res) => {
        res.status(501).json(
            {
                status: 501,
                message: 'Functionality has yet be realised',
                data: {}
            }
        )
    },

    getUser: (req, res, next) => {
        let userId = req.params.userId

        let sqlStatement = 'SELECT * FROM `user` WHERE `id` = ?'
        let params = [ userId ]

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error', err)
                next('error: ' + err.message)
            }
            if (conn) {
                conn.execute(sqlStatement,
                    params,
                    function (err, results, fields) {
                        if (err) {
                            next({
                                status: 409,
                                message: err.message
                            })
                        }
                        if (results) {
                            if (results.length == 0) {
                                res.status(404).json(
                                    {
                                        status: 404,
                                        message: `User with id ${userId} has not been found`,
                                        data: {}
                                    }
                                )
                            } else {
                                res.status(200).json(
                                    {
                                        status: 200,
                                        message: `User with id ${userId} has been found`,
                                        data: results[0]
                                    }
                                )
                            }
                        } 
                    })
            }
        })
    },

    updateUser: (req, res) => {
        let userId = req.params.userId
        let { firstName, lastName, street, city, emailAddress, password, phoneNumber } = req.body
        let sqlStatement = "UPDATE `user` SET `emailAddress` = ?"
        let params = [ emailAddress ]

        // Check if parameters are the right datatype and are valid
        try {
            assert(typeof emailAddress === 'string', 'emailAddress must be a string')
            if (!validateEmailAddress(emailAddress)) {
                throw new Error('EmailAddress is not formatted correctly')
            }
            if (firstName) {
                assert(typeof firstName === 'string', 'firstName must be a string')
                params[params.length] = firstName
                sqlStatement = sqlStatement.concat(', `firstName` = ?')
            }
            if (lastName) {
                assert(typeof lastName === 'string', 'lastName must be a string')
                params[params.length] = lastName
                sqlStatement = sqlStatement.concat(', `lastName` = ?')
            }
            if (street) {
                assert(typeof street === 'string', 'street must be a string')
                params[params.length] = street
                sqlStatement = sqlStatement.concat(', `street` = ?')
            }
            if (city) {
                assert(typeof city === 'string', 'city must be a string')
                params[params.length] = city
                sqlStatement = sqlStatement.concat(', `city` = ?')
            }
            if (password) {
                assert(typeof password === 'string', 'password must be a string')
                if (!validatePassword(password)) {
                    throw new Error('Password is not formatted correctly')
                }
                params[params.length] = password
                sqlStatement = sqlStatement.concat(', `password` = ?')
            }
            if (phoneNumber) {
                assert(typeof phoneNumber === 'string', 'phoneNumber must be a string')
                if (!validatePhoneNumber(phoneNumber)) {
                    throw new Error('Phonenumber is not formatted correctly')
                }
                params[params.length] = phoneNumber
                sqlStatement = sqlStatement.concat(', `phoneNumber` = ?')
            }

            sqlStatement = sqlStatement.concat(' WHERE `id` = ?')
            params[params.length] = userId

            // Check if emailAddress is present, if not throw error message
            if (!emailAddress) {
                res.status(400).json(
                    {
                        status: 400,
                        message: `The required parameter emailAddress is missing`,
                        data: {}
                    }
                )
            }

            pool.getConnection(function (err, conn) {
                if (err) {
                    console.log('error', err)
                    next('error: ' + err.message)
                }
                if (conn) {
                    conn.execute(
                        'SELECT * FROM `user` WHERE id = ?',
                        [ userId ],
                        function (err, results, fields) {
                            if (err) {
                                console.log(`Error: ${err.message}`)
                                next({
                                    status: 409,
                                    message: err.message
                                })
                            }
                            if (results.length > 0) {
                                conn.execute(
                                    sqlStatement,
                                    params,
                                    function (err, results, fields) {
                                        if (err) {
                                            console.log(`Error: ${err.message}`)
                                            next({
                                                status: 409,
                                                message: err.message
                                            })
                                        }
                                    }
                                )
                                conn.execute(
                                    'SELECT * FROM `user` WHERE id = ?',
                                    [ userId ],
                                    function(err, results, fields) {
                                        if (err) {
                                            console.log(`Error: ${err.message}`)
                                            next({
                                                status: 409,
                                                message: err.message
                                            })
                                        }
                                        if (results) {
                                            res.status(200).json(
                                                {
                                                    status: 200,
                                                    message: `User with id ${userId} has been edited succesfully`,
                                                    data: results[0]
                                                }
                                            )
                                        }
                                    }
                                )
                            } 
                            else {
                                res.status(404).json(
                                    {
                                        status: 404,
                                        message: `User with id ${userId} has not been found`,
                                        data: {}
                                    }
                                )
                            }
                        }
                    )
                }
            })
        } 
        catch (err) {
            res.status(400).json(
                {
                    status: 400,
                    message: err.toString(),
                    data: {}
                }
            )
        }
        
    },

    deleteUser: (req, res, next) => {
        let userId = req.params.userId
        let sqlStatement = 'DELETE FROM `user` WHERE `id` = ?'
        let params = [ userId ]

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log(`Error: ${err.message}`)
            }
            if (conn) {
                conn.execute(
                    'SELECT * FROM `user` WHERE `id` = ?',
                    params,
                    function (err, results, fields) {
                        if (err) {
                            console.log(`Error: ${err.message}`)
                            next({
                                status: 409,
                                message: err.message
                            })
                        }
                        if (results) {
                            if (results.length > 0) {
                                pool.getConnection(function (err, conn) {
                                    if (err) {
                                        console.log(`Error: ${err.message}`)
                                    }
                                    if (conn) {
                                        conn.execute(sqlStatement,
                                        params,
                                        function (err, results, fields) {
                                            if (err) {
                                                console.log(`Error: ${err.message}`)
                                                next({
                                                    status: 409,
                                                    message: err.message
                                                })
                                            }
                                            if (results) {
                                                res.status(200).json(
                                                    {
                                                        status: 200,
                                                        message: `User with id ${userId} has been deleted`,
                                                        data: {}
                                                    }
                                                )
                                            } else {
                                                
                                            }
                                        })
                                    }
                                })
                            } else {
                                res.status(404).json(
                                    {
                                        status: 404,
                                        message: `User with id ${userId} has not been found`,
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

function validateEmailAddress(emailAddress) {
    let pattern = /^[a-zA-Z]\.[a-zA-Z]{1,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/
    return regex(pattern, emailAddress)
}

function validatePassword(password) {
    let pattern = /^.{6,}$/ // Tenminste 1 hoofdletter, 1 cijfer en 8 karakters lang
    return regex(pattern, password)
}

function validatePhoneNumber(phoneNumber) {
    let pattern =/^[0-9]{2}[\s-]{0,1}[0-9]{8}$/
    return regex(pattern, phoneNumber)
}

function regex(pattern, value) {
    return pattern.test(value)
}

module.exports = userController
