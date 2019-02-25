const mongoose = require('mongoose');
const uuid = require('uuid/v1');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: 'Username is required'
    },
    password: { type: String, required: true },
    token: { type: String, index: true, unique: true },
    longitude: Number,
    latitude: Number,
    distance: Number,
    atLocation: Boolean,
    subscription: String
});

function comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) {
                reject();
            } else {
                resolve(result);
            }
        });
    });
}

function hashPassword(password) {
    const saltRounds = 10;
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                reject(err);
            } else {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            }
        });
    });
}

function createUser(username, hash) {
    return {
        username: username,
        token: uuid(),
        password: hash,
        longitude: -4.250346,
        latitude: 55.867245,
        distance: 500,
        atLocation: false
    };
}

userSchema.statics.login = function (username, password) {
    return new Promise((resolve, reject) => {
        this.model('User').findOne({ username: username }).then(user => {
            if (user) {
                comparePassword(password, user.password).then(success => {
                    if (success) {
                        user.token = uuid(); // Set session token.
                        user.save().then(resolve).catch(reject);
                    } else {
                        reject('Username or password incorrect');
                    }
                }).catch(reject);
            } else {
                hashPassword(password).then(hash => {
                    this.model('User').create(createUser(username, hash)).then(user => {
                        resolve(user);
                    });
                }).catch(reject)
            }
        });
    });
};

userSchema.methods.logout = function () {
    return new Promise((resolve, reject) => {
        this.token = '';
        this.save().then(resolve).catch(reject);
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
