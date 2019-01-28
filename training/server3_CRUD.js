const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _USERS = require('../users.json');

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

app.get('/findall', (req, res) => {
    User.findAll({
        where: {
            // name: 'Veda'
            name: {
                [Op.like]: 'Ve%'
            }
        }
    })
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            console.log(error);
            res.status(404).send(error);
        })
});

app.get('/findOne', (req, res) => {
    User.findById('1')
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            console.log(error);
            res.status(404).send(error);
        })
});

app.delete('/remove', (req, res) => {
    User.destroy({
            where: {
                id: '1'
            }
        })
        .then(user => {
            res.send('User successfully deleted.');
        })
        .catch(error => {
            console.log(error);
            res.status(404).send(error);
        })
});

app.put('/update', (req, res) => {
    User.update({
            name: 'Michael Keaton',
            password: 'password'
        },
        {
            where: {
                id: 1
            }
        })
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            console.log(error);
            res.status(404).send(error);
        })
});

app.post('/post', (req, res) => {
    const newUser = req.body.user;
    User.create(newUser)
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
        //force: true
        //logging: console.log
    })
    // .then(() => {
    //     User.bulkCreate(_USERS)
    //         .then(users => {
    //             console.log('Success adding users')
    //         })
    //         .catch(error => {
    //             console.log(error);
    //         })
    // })
    //.authenticate() <=> .sync()
    .then(() => {
        console.log('Connection to database established successfully.');
    }).catch(err => {
        console.log('Unable to connect to database: ', err);
    });

app.listen(port, () => {
    console.log('Running server on port ' + port);
});
