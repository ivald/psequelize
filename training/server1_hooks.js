const express = require('express');
const Sequelize = require('sequelize');

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
    uuid: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    first: Sequelize.STRING,
    last: Sequelize.STRING,
    full_name:Sequelize.STRING,
    bio: Sequelize.TEXT
},{
    hooks: {
        beforeValidate: () => {
            console.log('before validate');
        },
        afterValidate: () => {
            console.log('after validate');
        },
        beforeCreate: (user) => {
            user.full_name = `${user.first} ${user.last}`
            console.log('before create');
        },
        afterCreate: () => {
            console.log('after create');
        }
    }
});

app.get('/', (req, res) => {
    User.create({
        name: 'Jo',
        bio: 'New bio entry'
    })
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
        force: true,
        logging: console.log
    })
    .then(() => {
        User.create({
            first: 'Joe',
            last: 'Smith',
            bio: 'New bio entry'
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
