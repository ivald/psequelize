const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
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

const Post = connectionpg.define('Post', {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    title: Sequelize.STRING,
    content: Sequelize.TEXT
});

// Post.belongsTo(User); // puts foreignKey UserId in Post table
Post.belongsTo(User, { as: 'UserRef',  foreignKey: 'userId' }); // puts foreignKey UserId in Post table

app.get('/allPosts', (req, res) => {
    Post.findAll({
        include: [{
            model: User,
            as: 'UserRef'
        }]
    })
    .then(posts => {
        res.json(posts);
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
    .then(() => {
        Post.create({
            userId: 1,
            title: 'First post',
            content: 'post content 1'
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
