// passport is also imported at app.js
// the configuration made at app.js is available here too
// do not configure it again
const passport = require('passport');
//const User = require('../model/user');
const LocalStrategy = require('passport-local').Strategy;

// how to serialize user to store in session
passport.serializeUser((user, callback) => {
    callback(null, user._id);
});

// how to deserailize user from serialized data (user)
passport.deserializeUser((id, callback) => {
    User.findById(id, (err, user) => {
        callback(err, user);
    })
});

const localStrategyConfig = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // pass the eniter request to the callback
}

/*passport.use('localsignup',
    new LocalStrategy(localStrategyConfig, (req, email, password, callback) => {
        User.findOne({'email': email}, (err, user) => {
            if (err) return callback(null, false, req.flash('signuperror', err));
            if (user) return callback(null, false, req.flash('signuperror','Email is already in use'));

            const newUser = new User();
            newUser.email = email;
            newUser.encryptPassword(password, (err, result) => {
                if (err) return callback(null, false, req.flash('signuperror', err));
                newUser.password = result;
                newUser.save((err, result) => {
                    if (err) return callback(err);
                    return callback(null, newUser, req.flash('signupsuccess', 'Sign up successful! Login, please!'));
                });
            });
        });
    })
);*/

passport.use('login',
    new LocalStrategy( (email, password, callback) => {
    
        UserSch.findOne({'email': email}, 'firstName password verified isFaculty isAdmin', (err, user) => {
            if(user && user.verified){
                //console.log('user found');
                bcrypt.compare(password, user.password, (err, comp) => {
                    if(err || !comp){
                        user = null;
                    }
                       return callback(user);
                });
            } else {
                user = null;
                return callback(user);
            }
        });
    })
);