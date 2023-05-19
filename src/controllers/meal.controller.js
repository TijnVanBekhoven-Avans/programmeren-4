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
                                                code: 501,
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
    }
}

module.exports = mealController