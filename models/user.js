const mongoose = require('mongoose');
const uuid = require('uuid/v1');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email is required',
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email']
    },
    password: { type: String, required: true },
    token: { type: String, index: true, unique: true },
    longitude: Number,
    latitude: Number,
    distance: Number,
    atLocation: Boolean
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

function createUser(email, hash) {
    return {
        email: email,
        token: uuid(),
        password: hash,
        longitude: -4.250346,
        latitude: 55.867245,
        distance: 500,
        atLocation: false
    };
}

userSchema.statics.login = function (email, password) {
    return new Promise((resolve, reject) => {
        this.model('User').findOne({ email: email }).then(user => {
            if (user) {
                comparePassword(password, user.password).then(success => {
                    if (success) {
                        user.token = uuid(); // Set session token.
                        user.save().then(resolve).catch(reject);
                    } else {
                        reject('Email or password incorrect');
                    }
                }).catch(reject);
            } else {
                hashPassword(password).then(hash => {
                    this.model('User').create(createUser(email, hash)).then(user => {
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
