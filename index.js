//Advisement Scheduler
//Author: Bryan Carroll
//main entry

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt'); //password hashing
const nodeMailer = require('nodemailer'); //emails
const ejs = require('ejs');
const randomString = require('randomstring');
const flatpickr = require('flatpickr');
const passport = require('passport');

//native
const path = require('path');
const fs = require('fs');

const RegistrationInfo = require('./models/RegistrationInfo');
const EditProfile = require('./models/EditProfile');

// run and connect to the database
require('./models/database');
const UserSch = require('./models/userSchema');
const AdvisementSch = require('./models/advisementSchema');
const AppointmentSch = require('./models/appointmentSchema');

//*****************************************************************/
//Express config
const expr = express();

expr.set('view engine', 'ejs');
expr.set('views', './views');

expr.use(express.static(__dirname));

expr.use(express.urlencoded( {extended: false} ));

expr.use(session({
	secret: 'mysecretkey',
	resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60*60*1000, // if inactive, session expires in 1 hour
        path: '/'
    }
}));

expr.use(passport.initialize());
expr.use(passport.session()); // for persistent login sessions
require('./config/passport');


//*****************************************************************/
//nodemailer configuration

const emailSendAcct = ''; // need email before use

const emailTransporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: '', // need email before use
        pass: '' // need password before use
    }
});

//*****************************************************************/
//verify

function isFaculty(req, res, callback){

    let email = req.session.email;
    
    UserSch.findOne({'email': email}, 'isFaculty', (err, user) => {
        if(err || !user.isFaculty){
            let msg = 'You do not have access to this page.';
            res.render('message', {message: msg});
            return callback(false);
        } else {
            return callback(true);
        }
    });
}

function isAdmin(req, res, callback){

    let email = req.session.email;
    
    UserSch.findOne({'email': email}, 'isAdmin', (err, user) => {
        if(err || !user.isAdmin){
            let msg = 'You do not have access to this page.';
            res.render('message', {message: msg});
            return callback(false);
        } else {
            return callback(true);
        }
    });
}

//*****************************************************************/
//multer config

const uploadImagePrefix = 'image-';
const uploadDir = './public/images';
// set storage options of multer
const storageOptions = multer.diskStorage({
    destination: (req, file, callback) => {
        // upload dir path
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        callback(null, uploadImagePrefix + Date.now()
            + path.extname(file.originalname));
    }
});

// configure multer
const MAX_FILESIZE = 1024 * 1024 * 3; // 3 MB
const fileTypes = /jpeg|jpg|png|gif/; // accepted file types in regexp

const upload = multer({
    storage: storageOptions,
    limits: {
        fileSize: MAX_FILESIZE
    }, 
    fileFilter: (req, file, callback) => {
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (mimetype && extname) {
            return callback(null, true);
        } else {
            return callback('Error: Images only');
        }
    }
}).single('imageUpload'); // parameter name at <form> of index.ejs

//*****************************************************************/

expr.post('/viewManageDay', (req, res) => {

    if(req.session && req.session.isFaculty){

        let id = req.body.id;
        let date = req.body.date;

        AdvisementSch.findOne({'id': id}, (err, advisement) => {
            if(err && !advisement){
                let msg = 'Unable to return advisement.';
                return res.render('message', {message: msg});
            } else {
                AppointmentSch.find({'advisementID': id, 'date': date}, (err, appointments) => {
                    if(err && !appointments){
                        let msg = 'Error retrieving appointments.';
                        return res.render('message', {message: msg});
                    } else {
                        UserSch.find({}, 'email firstName lastName', (err, users) => {

                            let time = [];
                            time = advisement.startTime.split(':');
                            let start = new Date(0);
                            start.setHours(Number(time[0]));
                            start.setMinutes(Number(time[1]));

                            time = advisement.endTime.split(':');
                            let end = new Date(0);
                            end.setHours(Number(time[0]));
                            end.setMinutes(Number(time[1]));

                            let taken = [];
                            let timeSlots = [];
                            let names = [];

                            while(start < end){
                                let mins = start.getMinutes();
                                if(mins == 0){mins = '00';}
                                timeSlots.push(start.getHours() + ':' + mins);

                                let match = false;
                                let nameMatch = 0;
                                for(let iii = 0; iii< appointments.length; iii++){
                                    if(appointments[iii].time == start.getHours() + ":" + mins){
                                        match = true;
                                        nameMatch = iii;
                                    }
                                }
                                if(match){
                                    for(let eee = 0; eee < users.length; eee++){
                                        if(appointments[nameMatch].email == users[eee].email){
                                            names.push(users[eee].firstName + ' ' + users[eee].lastName);
                                        }
                                    }
                                    taken.push(true);
                                } else {
                                    names.push('');
                                    taken.push(false);
                                }
                                start.setMinutes(start.getMinutes() + 10);
                            }

                            return res.render('viewManageDay', {names, taken, date: date, advisement, timeSlots, appointments, name: req.session.firstName, nav: 'manage', faculty: req.session.isFaculty});
                        });
                    }
                });
            }
        });
    } else {
        res.redirect('login');
    }
});

expr.post('/viewManageAdvisement', (req, res) => {

    if(req.session && req.session.isFaculty){

        let id = req.body.id;

        AdvisementSch.findOne({'id': id}, (err, advisement) => {
            if(err && !advisement){
                let msg = 'Unable to return advisement.';
                return res.render('message', {message: msg});
            } else {
                let start = new Date(advisement.startDate);
                start.setDate(start.getDate() + 1);
                let end = new Date(advisement.endDate);
                end.setDate(end.getDate() + 1);
                
                let dates = [];
                let weekdays = [];
                
                let day = [7];
                day[0] = "Sunday";
                day[1] = "Monday";
                day[2] = "Tuesday";
                day[3] = "Wednesday";
                day[4] = "Thursday";
                day[5] = "Friday";
                day[6] = "Saturday";

                while(start <= end){

                    let add = false;

                    switch(start.getDay()){
                        case 0:
                            if(advisement.sunday){add = true}
                            break;
                        case 1:
                            if(advisement.monday){add = true}
                            break;
                        case 2:
                            if(advisement.tuesday){add = true}
                            break;
                        case 3:
                            if(advisement.wednesday){add = true}
                            break;
                        case 4:
                            if(advisement.thursday){add = true}
                            break;
                        case 5:
                            if(advisement.friday){add = true}
                            break;
                        case 6:
                            if(advisement.saturday){add = true}
                            break;
                    }

                    if(add){
                        dates.push(start.toDateString());
                        weekdays.push(day[start.getDay()]);
                    }

                    start.setDate(start.getDate() + 1);
                }

                return res.render('viewManageAdvisement', {dates, weekdays, advisement, name: req.session.firstName, nav: 'manage', faculty: req.session.isFaculty});
            }
        });
    } else {
        res.redirect('login');
    }
});

expr.post('/setAppointment', (req, res) => {

    if(req.session){ 

        let id = req.body.id;
        let date = req.body.date;
        let time = req.body.time;
        let email = req.session.email;

        AppointmentSch.findOne({'advisementID': id, 'email': email}, (err, appointment) => {
            if(err){
                let msg = 'Unable to return advisement.';
                return res.render('message', {message: msg});
            } else if(appointment) {
                let hdr = 'Appointment';
                let msg = 'Existing Appointment found. Can not create second appointment.';
                return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'advisement', faculty: req.session.isFaculty});
            } else {
                const newAppt = new AppointmentSch({
                    advisementID: id,
                    email: email,
                    date: date,
                    time: time
                });
    
                newAppt.save((err, results) => {
                    if (err && !results) {
                        let hdr = 'Error';
                        let msg = 'Error saving data.';
                        return res.render('indexMessage', {time: time, header: hdr, message: msg, name: req.session.firstName, nav: 'advisement', faculty: req.session.isFaculty});
                    }
                    let hdr = 'Done';
                    let msg = 'Appointment is scheduled. ' + date + ' at ' + time + '.';
                    return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'advisement', faculty: req.session.isFaculty});
                });
            }
        });
    } else {
        res.redirect('login');
    }
});

expr.post('/viewDay', (req, res) => {

    if(req.session){

        let id = req.body.id;
        let date = req.body.date;

        AdvisementSch.findOne({'id': id}, (err, advisement) => {
            if(err && !advisement){
                let msg = 'Unable to return advisement.';
                return res.render('message', {message: msg});
            } else {
                AppointmentSch.find({'advisementID': id, 'date': date}, (err, appointments) => {
                    if(err && !appointments){
                        let msg = 'Error retrieving appointments.';
                        return res.render('message', {message: msg});
                    } else {

                        let time = [];
                        time = advisement.startTime.split(':');
                        let start = new Date(0);
                        start.setHours(Number(time[0]));
                        start.setMinutes(Number(time[1]));

                        time = advisement.endTime.split(':');
                        let end = new Date(0);
                        end.setHours(Number(time[0]));
                        end.setMinutes(Number(time[1]));

                        let taken = [];

                        let timeSlots = [];
                        while(start < end){
                            let mins = start.getMinutes();
                            if(mins == 0){mins = '00';}
                            timeSlots.push(start.getHours() + ':' + mins);
                            /*if(iii < appointments.length){
                                if(appointments[iii].time == start.getHours() + ":" + mins){
                                    taken.push(true);
                                    iii++;
                                } else {
                                    taken.push(false);
                                }
                            } else {
                                taken.push(false);
                            }*/
                            let match = false;
                            for(let iii = 0; iii< appointments.length; iii++){
                                if(appointments[iii].time == start.getHours() + ":" + mins){
                                    match = true;
                                }
                            }
                            if(match){
                                taken.push(true);
                            } else {
                                taken.push(false);
                            }
                            start.setMinutes(start.getMinutes() + 10);
                        }

                        return res.render('viewDay', {taken, date: date, advisement, timeSlots, appointments, name: req.session.firstName, nav: 'advisement', faculty: req.session.isFaculty});
                    }
                });
            }
        });
    } else {
        res.redirect('login');
    }
});

expr.post('/viewAdvisement', (req, res) => {

    if(req.session){

        let id = req.body.id;

        AdvisementSch.findOne({'id': id}, (err, advisement) => {
            if(err && !advisement){
                let msg = 'Unable to return advisement.';
                return res.render('message', {message: msg});
            } else {
                let start = new Date(advisement.startDate);
                start.setDate(start.getDate() + 1);
                let end = new Date(advisement.endDate);
                end.setDate(end.getDate() + 1);
                
                let dates = [];
                let weekdays = [];
                
                let day = [7];
                day[0] = "Sunday";
                day[1] = "Monday";
                day[2] = "Tuesday";
                day[3] = "Wednesday";
                day[4] = "Thursday";
                day[5] = "Friday";
                day[6] = "Saturday";

                while(start <= end){

                    let add = false;

                    switch(start.getDay()){
                        case 0:
                            if(advisement.sunday){add = true}
                            break;
                        case 1:
                            if(advisement.monday){add = true}
                            break;
                        case 2:
                            if(advisement.tuesday){add = true}
                            break;
                        case 3:
                            if(advisement.wednesday){add = true}
                            break;
                        case 4:
                            if(advisement.thursday){add = true}
                            break;
                        case 5:
                            if(advisement.friday){add = true}
                            break;
                        case 6:
                            if(advisement.saturday){add = true}
                            break;
                    }

                    if(add){
                        dates.push(start.toDateString());
                        weekdays.push(day[start.getDay()]);
                    }

                    start.setDate(start.getDate() + 1);
                }

                return res.render('viewAdvisement', {dates, weekdays, advisement, name: req.session.firstName, nav: 'advisement', faculty: req.session.isFaculty});
            }
        });
    } else {
        res.redirect('login');
    }
});

expr.get('/advisement', (req, res) => {

    if(req.session){
        AdvisementSch.find({}, (err, advisements) => {
            if(err && !advisements){
                let msg = 'Error retrieving advisements.';
                return res.render('message', {message: msg});
            } else {
                return res.render('advisement', {advisements, name: req.session.firstName, nav: 'advisement', faculty: req.session.isFaculty});
            }
        });
    } else {
        res.redirect('login');
    }
});

expr.get('/manage', (req, res) => {

    if(req.session && req.session.isFaculty){
        AdvisementSch.find({'user': req.session.email}, (err, advisements) => {
            if(err && !advisements){
                let msg = 'Error retrieving advisements.';
                return res.render('message', {message: msg});
            } else {
                res.render('manage', {advisements, name: req.session.firstName, nav: 'manage', faculty: req.session.isFaculty});
            }
        });
    } else {
        res.redirect('login');
    }
});

expr.get('/createAdvisement', (req, res) => {
    
    res.render('createAdvisement', {advisement: false, atLeastOne: true, name: req.session.firstName, nav: 'manage', faculty: req.session.isFaculty});
});

expr.post('/createAdvisement', (req, res) => {

    upload(req, res, (err) => {

        if (err) {
            let hdr = 'Error';
            let message = 'Error uploading image.';
            return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'manage', faculty: req.session.isFaculty});
        }

        let advisement = {
            id: randomString.generate(7),
            title: req.body.title,
            image: '',
            description: req.body.description,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            monday: req.body.monday,
            tuesday: req.body.tuesday,
            wednesday: req.body.wednesday,
            thursday: req.body.thursday,
            friday: req.body.friday,
            saturday: req.body.saturday,
            sunday: req.body.sunday,
            dateCheck: false,
            timeCheck: false
        };

        let atLeastOne = false;
        if(advisement.monday == 'true'){
            advisement.monday = true;
            atLeastOne = true;
        } else {
            advisement.monday = false;
        }

        if(advisement.tuesday == 'true'){
            advisement.tuesday = true;
            atLeastOne = true;
        } else {
            advisement.tuesday = false;
        }

        if(advisement.wednesday == 'true'){
            advisement.wednesday = true;
            atLeastOne = true;
        } else {
            advisement.wednesday = false;
        }

        if(advisement.thursday == 'true'){
            advisement.thursday = true;
            atLeastOne = true;
        } else {
            advisement.thursday = false;
        }

        if(advisement.friday == 'true'){
            advisement.friday = true;
            atLeastOne = true;
        } else {
            advisement.friday = false;
        }

        if(advisement.saturday == 'true'){
            advisement.saturday = true;
            atLeastOne = true;
        } else {
            advisement.saturday = false;
        }

        if(advisement.sunday == 'true'){
            advisement.sunday = true;
            atLeastOne = true;
        } else {
            advisement.sunday = false;
        }

        /*console.log(advisement.title);
        console.log(advisement.description);
        console.log(advisement.startDate);
        console.log(advisement.endDate);
        console.log(advisement.startTime);
        console.log(advisement.endTime);
        console.log(advisement.monday);
        console.log(advisement.tuesday);
        console.log(advisement.wednesday);
        console.log(advisement.thursday);
        console.log(advisement.friday);
        console.log(advisement.saturday);
        console.log(advisement.sunday);*/

        let start = new Date(advisement.startDate);
        let end = new Date(advisement.endDate);
        advisement.dateCheck = end > start;
        advisement.timeCheck = advisement.endTime > advisement.startTime;

        if(!advisement.title
            || !advisement.startDate
            || !advisement.endDate
            || !advisement.startTime
            || !advisement.endTime
            || !atLeastOne
            || !advisement.dateCheck
            || !advisement.timeCheck){
                res.render('createAdvisement', {advisement, atLeastOne: atLeastOne, name: req.session.firstName, nav: 'manage', faculty: req.session.isFaculty});
        } else {

            if (req.file) {
                advisement.image = uploadDir + '/' + req.file.filename;
            }

            const newAdv = new AdvisementSch({
                id: advisement.id,
                user: req.session.email,
                title: advisement.title,
                image: advisement.image,
                description: advisement.description,
                startDate: advisement.startDate,
                endDate: advisement.endDate,
                startTime: advisement.startTime,
                endTime: advisement.endTime,
                monday: advisement.monday,
                tuesday: advisement.tuesday,
                wednesday: advisement.wednesday,
                thursday: advisement.thursday,
                friday: advisement.thursday,
                saturday: advisement.saturday,
                sunday: advisement.sunday
            });

            newAdv.save((err, results) => {
                if (err && !results) {
                    let hdr = 'Error';
                    let msg = 'Error saving data.';
                    return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'manage', faculty: req.session.isFaculty});
                }
                return res.redirect('manage');
            });
        }
    });
});

expr.get('/', (req, res) => {
    res.redirect('login');
});

expr.get('/login', (req, res) => {
    res.render('login', {notFound: false});
});

expr.post('/login', (req, res) => {

    let email = req.body.email;
    let password = req.body.password;

    UserSch.findOne({'email': email}, 'firstName password verified isFaculty isAdmin', (err, user) => {
        if(user && user.verified){
            //console.log('user found');
            bcrypt.compare(password, user.password, (err, comp) => {
                if(comp){
                    //console.log('login successful')
                    //session data is stored server-side
                    req.session.email = email;
                    req.session.firstName = user.firstName;
                    req.session.isFaculty = user.isFaculty;
                    req.session.isAdmin = user.isAdmin;
                    res.render('index', {name: req.session.firstName, nav: 'none', faculty: req.session.isFaculty});
                } else {
                    //console.log('login fail');
                    res.render('login', {notFound: true});
                }
            });
        } else {
            //console.log('user not found');
            res.render('login', {notFound: true});
        }
    });
});

/*
expr.post('/login', (req, res) => {
    passport.authenticate('login', {
        successRedirect: '/index',
        failureRedirect: '/login',
        failureFlash: false
    });
});*/

expr.get('/index', (req, res) => {

    if(req.session){
        res.render('index', {name: req.session.firstName, nav: 'none', faculty: req.session.isFaculty});
    } else {
        res.redirect('login', {notFound: false});
    }
});

expr.get('/register', (req, res) => {
    res.render('register', {initial: true});
});

expr.post('/register', (req, res) => {

    regInfo = new RegistrationInfo(req.body.email,
                                    req.body.firstName,
                                    req.body.lastName,
                                    req.body.UCOID,
                                    req.body.password,
                                    req.body.verifyPassword,
                                    req.body.degree,
                                    req.body.phoneNumber
                                );

    if(regInfo.isComplete()){
        
        bcrypt.hash(regInfo.password, 10, (err, hash) => {

            const verificationCode = randomString.generate(7); // 7 characters is about 78 billion combinations

            regInfo.verificationCode = verificationCode;

            const newUser = new UserSch({
                email: regInfo.email,
                firstName: regInfo.firstName,
                lastName: regInfo.lastName,
                UCOID: regInfo.UCOID,
                password: hash,
                degree: regInfo.degree,
                phoneNumber: regInfo.phoneNumber,
                verified: false,
                verificationCode: verificationCode,
                isFaculty: false,
                isAdmin: false
            });

            newUser.save((err, results) => {
                if (err) {
                    return results.status(500).send('<h1>save() in db error</h1>', err);
                } else {
                    let ejsFile = fs.readFileSync(__dirname + '/views/registrationEmail.ejs', 'utf-8');
                    const emailBody = ejs.render(ejsFile, {regInfo});
                    //console.log(emailBody);

                    const registrationEmail = {
                        from: emailSendAcct,
                        to: regInfo.email,
                        subject: 'UCO:CS Verification Required',
                        html: emailBody
                    };

                    emailTransporter.sendMail(registrationEmail, (err, info) => {
                        if(err){
                            console.log(err);
                        }
                        console.log("Email sent: ", info);
                    });
                    
                    let msg = 'Thank you for registering! Follow the link in your email to verify your account.'
                    return res.render('message', {message: msg});
                }
            });
        });
    } else {
        res.render('register', {regInfo, initial: false});
    }

});

expr.get('/accessDenied', (req, res) => {
    let hdr = 'Access Denied';
    let msg = 'You do not have access to this page.';
    return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
});

expr.get('/verify/:email/:verificationCode', (req, res) => {

    //console.log(req.params.email);
    //console.log(req.params.verificationCode);

	const query = {email: req.params.email, verificationCode: req.params.verificationCode};
	const value = {
		$set: {
			verified: true
		}
    };
    
	UserSch.findOneAndUpdate(query, value, (err, results) => {
		if (err) {
            let msg = 'Unable to complete verification!';
            return res.render('message', {message: msg});
        } else {
            return res.render('verificationComplete');
        }
	});
});

expr.get('/myProfile', (req, res) => {

    let email = req.session.email;

    UserSch.findOne({'email': email}, (err, user) => {
        if(err){
            let msg = 'Unable to return user.';
            return res.render('message', {message: msg});
        } else {
            res.render('myProfile', {user, name: req.session.firstName, nav: 'myProfile', faculty: req.session.isFaculty});
        }
    });
});

expr.get('/editMyProfile', (req, res) => {

    let email = req.session.email;

    UserSch.findOne({'email': email}, (err, user) => {
        if(err){
            let msg = 'Unable to return user.';
            return res.render('message', {message: msg});
        } else {
            res.render('editMyProfile', {user, name: req.session.firstName, nav: 'myProfile', faculty: req.session.isFaculty, initial: true});
        }
    });
});

expr.post('/editMyProfile', (req, res) => {

    const user = new EditProfile(req.body.email,
                                req.body.firstName,
                                req.body.lastName,
                                req.body.UCOID,
                                req.body.degree,
                                req.body.phoneNumber);
    if(user.isComplete()){

        let email = req.session.email;
        const query = {email: email};

        const value = {
            $set: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                UCOID: req.body.UCOID,
                degree: req.body.degree,
                phoneNumber: req.body.phoneNumber,
            }
        };

        UserSch.findOneAndUpdate(query, value, (err, results) => {
            if (err) {
                let hdr = 'Error';
                let msg = 'Unable to edit user.';
                return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
            } else {
                UserSch.findOne({'email': email}, (err, user) => {
                    if(err){
                        let msg = 'Unable to return user.';
                        return res.render('message', {message: msg});
                    } else {
                        req.session.firstName = req.body.firstName;
                        res.render('myProfile', {user, name: req.session.firstName, nav: 'myProfile', faculty: req.session.isFaculty});
                    }
                });
            }
        });
    } else {
        res.render('editMyProfile', {user, name: req.session.firstName, nav: 'myProfile', faculty: req.session.isFaculty, initial: false});
    }
});

expr.get('/users', (req, res) => {

    if(req.session){
        if(req.session.isFaculty){
            UserSch.find({}, (err, users) => {
                if(err){
                    let msg = 'Error retrieving users.';
                    return res.render('message', {message: msg});
                } else {
                    return res.render('users', {users, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
                }
            });
        } else {
            res.redirect('accessDenied');
        }
    } else {
        res.redirect('login');
    }
});

expr.post('/viewUser', (req, res) => {

    let email = req.body.email;
    //console.log(email);

    UserSch.findOne({'email': email}, (err, user) => {
        if(err){
            let msg = 'Unable to return user.';
            return res.render('message', {message: msg});
        } else {
            //console.log(user);
            res.render('viewUser', {user, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        }
    });
});

expr.post('/deleteUserConfirm', (req, res) => {
    let email = req.body.email;
    console.log(email);

    UserSch.findOne({'email': email}, (err, user) => {
        if(err){
            let msg = 'Unable to return user.';
            return res.render('message', {message: msg});
        } else {
            console.log(user);
            return res.render('deleteUserConfirm', {user, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        }
    });
});

expr.post('/deleteUser', (req, res) => {
    let email = req.body.email;

    UserSch.findOneAndRemove({'email': email}, (err, result) => {
        if(err){
            let hdr = 'Error';
            let msg = 'Unable to delete user.';
            return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        } else {
            let hdr = 'Delete Confirmation';
            let msg = 'User has been deleted.';
            return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        }
    });
});

expr.post('/editUserPage', (req, res) => {
    let email = req.body.email;

    UserSch.findOne({'email': email}, (err, user) => {
        if(err){
            let hdr = 'Error';
            let msg = 'Unable to query user.';
            return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        } else {
            return res.render('editUser', {user, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        }
    });
});

expr.post('/editUser', (req, res) => {

    const query = {email: req.body.email};

    let uVerified = false;
    if(req.body.verified == "true"){
        uVerified = true;
    }

    let uIsFaculty = false;
    if(req.body.isFaculty == "true"){
        uIsFaculty = true;
    }

    let uIsAdmin = false;
    if(req.body.isAdmin == "true"){
        uIsAdmin = true;
    }
    
	const value = {
		$set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            UCOID: req.body.UCOID,
            degree: req.body.degree,
            phoneNumber: req.body.phoneNumber,
            verified: uVerified,
            isFaculty: uIsFaculty,
            isAdmin: uIsAdmin
		}
    };

	UserSch.findOneAndUpdate(query, value, (err, results) => {
		if (err) {
            let hdr = 'Error';
            let msg = 'Unable to edit user.';
            return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        } else {
            UserSch.findOne({'email': req.body.email}, (err, user) => {
                if(err){
                    let msg = 'Unable to return user.';
                    return res.render('message', {message: msg});
                } else {
                    res.render('viewUser', {user, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
                }
            });
        }
	});
});

expr.post('/editUserPage', (req, res) => {
    let email = req.body.email;

    UserSch.findOne({'email': email}, (err, user) => {
        if(err){
            let hdr = 'Error';
            let msg = 'Unable to query user.';
            return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        } else {
            return res.render('editUser', {user, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        }
    });
});

expr.post('/resetUserPassword', (req, res) => {

    let email = req.body.email;

    UserSch.findOne({'email': email}, (err, user) => {
        if(!user){
            let hdr = 'Error';
            let msg = 'Unable to query user.';
            return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
        } else {
            let ejsFile = fs.readFileSync(__dirname + '/views/passwordEmail.ejs', 'utf-8');
            const emailBody = ejs.render(ejsFile, {user});
            //console.log(emailBody);

            const passwordEmail = {
                from: emailSendAcct,
                to: req.body.email,
                subject: 'UCO:CS Password Reset',
                html: emailBody
            };

            emailTransporter.sendMail(passwordEmail, (err, info) => {
                if(err){
                    let hdr = 'Error';
                    let msg = 'Unable to email user.';
                    return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
                }
                let hdr = 'Password reset';
                let msg = 'Password reset email sent to user.';
                return res.render('indexMessage', {header: hdr, message: msg, name: req.session.firstName, nav: 'users', faculty: req.session.isFaculty});
            });
        }
    });
});

function sendPasswordEmail(email, callback){
    
    UserSch.findOne({'email': email}, (err, user) => {
        if(!user){
            return callback('Unable to find email.', null);
        } else {
            let ejsFile = fs.readFileSync(__dirname + '/views/passwordEmail.ejs', 'utf-8');
            const emailBody = ejs.render(ejsFile, {user});
            //console.log(emailBody);

            const passwordEmail = {
                from: emailSendAcct,
                to: email,
                subject: 'UCO:CS Password Reset',
                html: emailBody
            };

            emailTransporter.sendMail(passwordEmail, (err, info) => {
                if(err){
                    return callback('Unable to send email.', null);
                } else {
                    return callback(null, true);
                }
            });
        }
    });
}

expr.get('/sendResetEmail', (req, res) => {

    res.render('sendResetEmail', {err: false, email: false});
});

expr.post('/sendResetEmail', (req, res) => {

    let email = req.body.email;

    if(email == ""){
        res.render('sendResetEmail', {err: false, email: false});
    } else {
        sendPasswordEmail(email, (err, success) => {
            if(err){
                res.render('sendResetEmail', {err: err, email: email});
            } else {
                let msg = 'Password reset email sent.';
                res.render('message', {message: msg});
            }
        });
    }
});

expr.get('/passwordReset/:email/:verificationCode', (req, res) => {

    res.render('passwordReset', {email: req.params.email, vCode: req.params.verificationCode, match: true});
});

expr.post('/passwordReset', (req, res) => {

    let uEmail = req.body.email;
    let password = req.body.password;
    let verifyPassword = req.body.verifyPassword;
    let uVerificationCode = req.body.verificationCode;

    if(verifyPassword != password){
        return res.render('passwordReset', {email: uEmail, vCode: uVerificationCode, match: false});
    }

    bcrypt.hash(password, 10, (err, hash) => {

        const query = {email: uEmail, verificationCode: uVerificationCode};
        const value = {
            $set: {
                password: hash
            }
        };
        
        UserSch.findOneAndUpdate(query, value, (err, results) => {
            if (err) {
                let msg = 'Unable to complete password reset!';
                return res.render('message', {message: msg});
            } else {
                let msg = 'Password is reset!';
                return res.render('message', {message: msg});
            }
        });
    });
});

expr.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('message', {message: 'Logout successful.'});
});

const port = process.env.PORT || 3000;
expr.listen(port, () => {
    console.log('Server started at port', port);
});

