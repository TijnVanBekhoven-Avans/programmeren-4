// In memory database to store users
let database = {
    users: [
        {
            id: 0,
            firstName: 'Tijn',
            lastName: 'van Bekhoven',
            street: 'Philips Vingboonsstraat 18',
            city: 'Tilburg',
            isActive: true,
            emailAddress: 'tijnvbek@gmail.com',
            password: 'secret',
            phoneNumber: '06 12345678'
        },
        {
            id: 1,
            firstName: 'Jaap',
            lastName: 'van Bekhoven',
            street: 'Philips Vingboonsstraat 18',
            city: 'Tilburg',
            isActive: false,
            emailAddress: 'jaapvbek@gmail.com',
            password: 'secret',
            phoneNumber: '06 12345678'
        }
    ],
    index: 2
}

module.exports = database
