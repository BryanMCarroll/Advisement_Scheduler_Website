
// creates fake users for testing
// to run, start mongo shell, mongo.exe
// use command: load("<path>/fakeusers.js")
// note that mongo.exe uses forward slashes

var db = connect('localhost:27017/wspdb', '', 'password'); // (where, user, password) need username and password before use

db.asusers.remove({});

print('Existing users removed from asusers.');

// all users have password: 12345
 
db.asusers.insert({email: 'admin@uco.edu', 
                    firstName: 'admin',
                    lastName: 'admin',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: true,
                    isAdmin: true
});

db.asusers.insert({email: 'faculty@uco.edu', 
                    firstName: 'faculty',
                    lastName: 'faculty',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: true,
                    isAdmin: false
});

db.asusers.insert({email: 'user1@uco.edu', 
                    firstName: 'user1',
                    lastName: 'user1',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

db.asusers.insert({email: 'user2@uco.edu', 
                    firstName: 'user2',
                    lastName: 'user2',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

db.asusers.insert({email: 'user3@uco.edu', 
                    firstName: 'user3',
                    lastName: 'user3',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

db.asusers.insert({email: 'user4@uco.edu', 
                    firstName: 'user4',
                    lastName: 'user4',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

db.asusers.insert({email: 'user5@uco.edu', 
                    firstName: 'user5',
                    lastName: 'user5',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

db.asusers.insert({email: 'user6@uco.edu', 
                    firstName: 'user6',
                    lastName: 'user6',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

db.asusers.insert({email: 'user7@uco.edu', 
                    firstName: 'user7',
                    lastName: 'user7',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

db.asusers.insert({email: 'user8@uco.edu', 
                    firstName: 'user8',
                    lastName: 'user8',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

db.asusers.insert({email: 'user9@uco.edu', 
                    firstName: 'user9',
                    lastName: 'user9',
                    UCOID: '12345678',
                    password: '$2a$10$kNwTJ9AUcpHAku2ko7ZooOr74d.6e3ZtaDGxaeQdXzeNYDuxv8L4y',
                    degree: '6100',
                    phoneNumber: '4051234567',
                    verified: true,
                    verificationCode: '211jmTA',
                    isFaculty: false,
                    isAdmin: false
});

print('Users created in asusers.');