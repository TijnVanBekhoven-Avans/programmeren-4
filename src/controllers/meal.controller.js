const assert = require('assert')
const pool = require('../util/sql.database')
const convertToBoolean = require('../util/utils').convertToBoolean

const mealController = {
    createMeal: (req, res, next) => {
        try {
            let { name, description, dateTime, maxAmountOfParticipants, price, imageUrl } = req.body

            assert(typeof name === 'string', 'name must be a string')
            assert(typeof description === 'string', 'description must be a string')
            assert(typeof dateTime === 'string', 'dateTime must be a string')
            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number')
            assert(typeof price === 'number', 'price must be a number')
            assert(typeof imageUrl === 'string', 'imageUrl must be a string')

            pool.getConnection((err, conn) => {
                if (err) {
                    next({
                        code: 500,
                        message: err.message
                    })
                }
                if (conn) {
                    conn.execute(
                        'INSERT INTO `meal` (`name`, `description`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [ name, description, dateTime, maxAmountOfParticipants, price, imageUrl, req.userId ],
                        (err, results, fields) => {
                            if (err) {
                                next({
                                    code: 403,
                                    message: err.message
                                })
                            }
                        }
                    )
                    conn.execute(
                        'SELECT * FROM `meal` ORDER BY `id` DESC LIMIT 1',
                        (err, results, fields) => {
                            if (err) {
                                next({
                                    code: 403,
                                    message: err.message
                                })
                            }
                            if (results) {
                                conn.execute(
                                    'SELECT * FROM `user` WHERE `id` = ?',
                                    [ results[0].cookId ],
                                    (cookErr, cookResults, cookFields) => {
                                        if (cookErr) {
                                            next({
                                                code: 500,
                                                message: err.message
                                            })
                                        }
                                        if (cookResults) {
                                            let cook = cookResults[0]
                                            let meal = results[0]
                                            meal.cookId = undefined
                                            meal.cook = cook
                                            meal.participants = []

                                            meal.price = Number(meal.price)
                                            meal.isActive = convertToBoolean(meal.isActive)
                                            meal.isVega = convertToBoolean(meal.isVega)
                                            meal.isVegan = convertToBoolean(meal.isVegan)
                                            meal.isToTakeHome = convertToBoolean(meal.isToTakeHome)
                                            cook.isActive = convertToBoolean(cook.isActive)

                                            res.status(201).json({
                                                status: 201,
                                                message: `Meal with id ${results[0].id} successfully created`,
                                                data: results[0]
                                            })
                                        }
                                    }
                                )
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
                    message: err.message,
                    data: {}
                }
            )
        }
    },

    getMeals: (req, res, next) => {
        pool.getConnection((err, conn) => {
            if (err) {
                next({
                    code: 500,
                    message: err.message
                })
            }
            if (conn) {
                let meals

                conn.execute(
                    'SELECT * FROM `meal`',
                    (err, results, fields) => {
                        if (err) {
                            next({
                                code: 403,
                                message: err.message
                            })
                        }
                        if (results) {
                            meals = results

                            for (let i = 0; i < meals.length; i++) {
                                let cook
                                let participants = []

                                conn.execute(
                                    'SELECT * FROM `user` WHERE `id` = ?',
                                    [ meals[i].cookId ],
                                    (err, results, fields) => {
                                        if (err) {
                                            next({
                                                code: 403,
                                                message: err.message
                                            })
                                        }
                                        if (results) {
                                            cook = results[0]
                                            cook.isActive = convertToBoolean(cook.isActive)
                                            cook.password = undefined
                                            meals[i].cook = cook
                                        }
                                    }
                                )

                                conn.execute(
                                    'SELECT * FROM `meal_participants_user` WHERE mealId = ?',
                                    [ meals[i].id ],
                                    (err, results, fields) => {
                                        if (err) {
                                            next({
                                                code: 403,
                                                message: err.message
                                            })
                                        }
                                        if (results) {
                                            let participantIds = results

                                            for (let j = 0; j < participantIds.length; j++) {
                                                let participant

                                                conn.execute(
                                                    'SELECT * FROM `user` WHERE id = ?',
                                                    [ participantIds[j].userId ],
                                                    (err, results, fields) => {
                                                        if (err) {
                                                            next({
                                                                code: 403,
                                                                message: err.message
                                                            })
                                                        }
                                                        if (results)  {
                                                            participant = results[0]
                                                            participant.isActive = convertToBoolean(participant.isActive)
                                                            participant.password = undefined
                                                            participants[participants.length] = participant
                                                        }
                                                    }
                                                )
                                            }

                                            meals[i].participants = participants
                                        }
                                    }
                                )

                                meals[i].isActive = convertToBoolean(meals[i].isActive)
                                meals[i].isVega = convertToBoolean(meals[i].isVega)
                                meals[i].isVegan = convertToBoolean(meals[i].isVegan)
                                meals[i].isToTakeHome = convertToBoolean(meals[i].isToTakeHome)
                                meals[i].price = Number(meals[i].price)
                            }

                            setTimeout(() => {
                                res.status(200).json({
                                    status: 200,
                                    message: 'All meals have been retrieved successfully',
                                    data: meals
                                })
                            }, 50)
                        }
                    }
                )
            }
            pool.releaseConnection(conn)
        })
    },

    getMeal: (req, res, next) => {
        pool.getConnection((err, conn) => {
            if (err) {
                next({
                    code: 500,
                    message: err.message
                })
            }
            if (conn) {
                let mealId = req.params.mealId

                conn.execute(
                    'SELECT * FROM `meal` WHERE id = ?',
                    [ mealId ],
                    (err, results, fields) => {
                        if (err) {
                            next({
                                code: 403,
                                message: err.message
                            })
                        }
                        if (results) {
                            if (results[0]) {
                                meal = results[0]
                                meal.isActive = convertToBoolean(meal.isActive)
                                meal.isVega = convertToBoolean(meal.isVega)
                                meal.isVegan = convertToBoolean(meal.isVegan)
                                meal.isToTakeHome = convertToBoolean(meal.isToTakeHome)
                                meal.price = Number(meal.price)

                                conn.execute(
                                    'SELECT * FROM `user` WHERE id = ?',
                                    [ meal.cookId ],
                                    (err, results, fields) => {
                                        if (err) {
                                            next({
                                                code: 403,
                                                message: err.message
                                            })
                                        }
                                        if (results) {
                                            meal.cookId = undefined
                                            meal.cook = results[0]
                                            meal.cook.isActive = convertToBoolean(meal.cook.isActive)
                                            meal.cook.password = undefined
                                            participants = []

                                            conn.execute(
                                                'SELECT * FROM `meal_participants_user` WHERE mealId = ?',
                                                [ meal.id ],
                                                (err, results, fields) => {
                                                    if (err) {
                                                        next({
                                                            code: 403,
                                                            message: err.message
                                                        })
                                                    }
                                                    if (results) {
                                                        let participantIds = results
            
                                                        for (let j = 0; j < participantIds.length; j++) {
                                                            let participant
            
                                                            conn.execute(
                                                                'SELECT * FROM `user` WHERE id = ?',
                                                                [ participantIds[j].userId ],
                                                                (err, results, fields) => {
                                                                    if (err) {
                                                                        next({
                                                                            code: 403,
                                                                            message: err.message
                                                                        })
                                                                    }
                                                                    if (results)  {
                                                                        participant = results[0]
                                                                        participant.isActive = convertToBoolean(participant.isActive)
                                                                        participant.password = undefined
                                                                        participants[participants.length] = participant
                                                                    }
                                                                }
                                                            )
                                                        }
            
                                                        meal.participants = participants
                                                    }
                                                }
                                            )

                                            setTimeout(() => {
                                                res.status(200).json({
                                                    status: 200,
                                                    message: 'Meal has been found',
                                                    data: meal
                                                })
                                            }, 50)
                                        }
                                    }
                                )
                            } else {
                                next({
                                    code: 404,
                                    message: 'Meal not found'
                                })
                            }
                        }
                    }
                )
            }
            pool.releaseConnection(conn)
        })
    },

    deleteMeal: (req, res, next) => {
        pool.getConnection((err, conn) => {
            if (err) {
                next({
                    code: 500,
                    message: err.message
                })
            }
            if (conn) {
                mealId = req.params.mealId
                userId = req.userId

                conn.execute(
                    'SELECT * FROM `meal` WHERE id = ?',
                    [ mealId ],
                    (err, results, fields) => {
                        if (err) {
                            next({
                                code: 500,
                                message: err.message
                            })
                        }
                        if (results) {
                            if (results[0]) {
                                if (results[0].cookId === userId) {
                                    conn.execute(
                                        'DELETE FROM `meal` WHERE id = ?',
                                        [ mealId ],
                                        (err, results, fields) => {
                                            if (err) {
                                                next({
                                                    code: 500,
                                                    message: err.message
                                                })
                                            } else {
                                                next({
                                                    code: 200,
                                                    message: `Meal ${mealId} is deleted successfully`
                                                })
                                            }
                                        }
                                    )
                                } else {
                                    next({
                                        code: 403,
                                        message: 'Not authorised'
                                    })
                                }
                            } else {
                                next({
                                    code: 404,
                                    message: 'Meal not found'
                                })
                            }
                        }
                    }
                )
            }
            pool.releaseConnection(conn)
        })
    }
}

module.exports = mealController