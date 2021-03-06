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
    tokens: [{ type: String, index: true, unique: true }],
    longitude: Number,
    latitude: Number,
    distance: Number,
    atLocation: Boolean,
    subscriptions: [{ type: String, unique: true }],
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
        tokens: [],
        password: hash,
        longitude: -4.250346,
        latitude: 55.867245,
        distance: 500,
        atLocation: false,
        subscriptions: [],
        shortNotification: false,
        longNotification: false,
    };
}

userSchema.statics.login = function (username, password) {
    return this.model('User').findOne({ username: username }).exec().then(user => {
        if (user) {
            return handleExistingUser(this, password, user);
        } else {
            return handleNewUser(this, password, username);
        }
    });
};

function handleNewUser(schema, password, username) {
    return new Promise((resolve, reject) => {
        hashPassword(password).then(hash => {
            const defaultUser = createUser(username, hash);
            const token = uuid();
            defaultUser.tokens.push(token); // Set session token.
            schema.model('User').create(defaultUser).then(user => {
                resolve({
                    success: true,
                    token: token,
                    user: user
                });
            });
        }).catch(reject);
    });
}

function handleExistingUser(schema, password, user) {
    return new Promise((resolve, reject) => {
        comparePassword(password, user.password).then(success => {
            if (success) {
                const token = uuid();
                user.tokens.push(token); // Set session token.
                user.save().then(() => {
                    resolve({
                        success: true,
                        token: token,
                        user: user
                    });
                }).catch(reject);
            }
            else {
                resolve({
                    success: false
                });
            }
        }).catch(reject);
    });
}

userSchema.statics.findByToken = function (token) {
    return this.model('User').findOne({ tokens: token }).exec();
};

userSchema.statics.authToken = async function (token) {
    const user = await User.findByToken(token);
    if (user == null) {
        throw 'Invalid auth token';
    } else {
        return user;
    }
}

userSchema.statics.logout = function (token) {
    return this.model('User').findOneAndUpdate({ tokens: token }, { '$pull': { tokens: token } }).exec();
};

const User = mongoose.model('User', userSchema);

module.exports = User;