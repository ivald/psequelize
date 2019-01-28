const express = require('express');
const Sequelize = require('sequelize');
const _USERS = require('./users.json');

const app = express();
const port = 8001;

// const connectionsqlite = new Sequelize('db', 'user', 'pass', {
//     host: 'localhost',
//     dialect: 'sqlite',
//     storage: 'db.sqlite',
//     operatorsAliases: false
// });

// const connectionpg = new Sequelize('postgres://postgres:admin@localhost:5432/testdb');

const connectionpg = new Sequelize('testdb', 'postgres', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    operatorsAliases: false,
    define: {
        freezeTableName: true
    }
});

const User = connectionpg.define('User', {
    name: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.STRING,
        validate: {
            isAlphanumeric: true
        }
    }
});

app.post('/post', (req, res) => {
    const newUser = req.body.user;
    // User.create({
    //     name: newUser.name,
    //     email: newUser.email,
    //     password: newUser.password
    // })
    User.create(newUser) //Or simple like that, to pass an object
    .then(user => {
        res.json(user);
    })
    .catch(error => {
        console.log(error);
        res.status(404).send(error);
    })
});

connectionpg
    .sync({
        force: true
        //logging: console.log
    })
    .then(() => {
        User.bulkCreate(_USERS)
            .then(users => {
                console.log('Success adding users')
            })
            .catch(error => {
                console.log(error);
            })
    })
    //.authenticate() <=> .sync()
    .then(() => {
        console.log('Connection to database established successfully.');
    }).catch(err => {
        console.log('Unable to connect to database: ', err);
    });

app.listen(port, () => {
    console.log('Running server on port ' + port);
});
