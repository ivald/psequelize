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

const Post = connectionpg.define('Post', {
    title: Sequelize.STRING,
    content: Sequelize.TEXT
});

const Comment = connectionpg.define('Comment', {
    the_comment: Sequelize.STRING
});

const Project = connectionpg.define('Project', {
    title: Sequelize.STRING
});

// Post.belongsTo(User); // puts foreignKey UserId in Post table
Post.belongsTo(User, { as: 'UserRef',  foreignKey: 'userId' }); // puts foreignKey UserId in Post table
Post.hasMany(Comment, { as: 'All_Comments' }); // foreignKey = PostId in Comment table

// Creates a UserProjects table with IDs for ProjectId and UserId
User.belongsToMany(Project, { as: 'Tasks', through: 'UserProjects' });
Project.belongsToMany(User, { as: 'Workers', through: 'UserProjects' });

app.put('/addWorker', (req, res) => {
    Project.findById(2)
        .then((project) => {
            project.addWorkers(5)
        })
    .then(() => {
        res.send('User added');
    })
    .catch(error => {
        console.log(error);
        res.status(404).send(error);
    });
});

app.get('/getUserProjects', (req, res) => {
    User.findAll({
        attributes: ['name'],
        include: [{
            model: Project, as: 'Tasks',
            attributes: ['title']
        }]
    })
    .then((output) => {
        res.json(output)
    })
    .catch(error => {
        console.log(error);
        res.status(404).send(error);
    });
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
        Project.create({
            title: 'project 1'
        })
        .then((project) => {
            project.setWorkers([4, 5])
        })
    })
    .then(() => {
        Project.create({
            title: 'project 2'
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
