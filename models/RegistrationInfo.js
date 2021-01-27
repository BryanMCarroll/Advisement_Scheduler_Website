

class RegistrationInfo {

    constructor(email,
                firstName,
                lastName,
                UCOID,
                password,
                verifyPassword,
                degree,
                phoneNumber
    ){
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.UCOID = UCOID;
        this.password = password;
        this.verifyPassword = verifyPassword;
        this.degree = degree;
        this.phoneNumber = phoneNumber;
    }

    //for debugging
    print(){
        console.log(this.email.length);
        console.log(this.firstName);
        console.log(this.lastName);
        console.log(this.UCOID);
        console.log(this.password);
        console.log(this.verifyPassword);
        console.log(this.degree);
        console.log(this.phoneNumber);
    }

    isComplete(){
        if(!this.checkEmail()){
            return false;
        } else if(!this.checkFirstName()){
            return false;
        } else if(!this.checkLastName()){
            return false;
        } else if(!this.checkPasswords()){
            return false;
        } else if(!this.checkUCOID()){
            return false;
        } else if(!this.checkDegree()){
            return false;
        } else if(!this.checkPhoneNumber()){
            return false;
        } else {
            return true;
        }
    }

    checkEmail(){
        if(this.email.search('@uco.edu') == -1){
            return false;
        } else {
            return true;
        } 
    }

    emailWarning(){
        return 'Email must contain @uco.edu.';
    }

    checkFirstName(){
        if(this.firstName.length < 1){
            return false;
        } else {
            return true;
        }
    }

    firstNameWarning(){
        return 'First name is required.';
    }

    checkLastName(){
        if(this.lastName.length < 1){
            return false;
        } else {
            return true;
        }
    }

    lastNameWarning(){
        return 'Last name is required.';
    }

    checkUCOID(){
        if(this.UCOID.length < 8){
            return false;
        } else {
            return true;
        }
    }

    UCOIDWarning(){
        return 'UCO ID must be 8 digits long.';
    }

    checkPasswords(){
         if(!this.checkPasswordLength() || !this.checkVerifyPasswordLength() || !this.comparePasswords()){
             return false;
         } else {
             return true;
         }
    }

    checkPasswordLength(){
        if(this.password.length < 4){
            return false;
        } else {
            return true;
        }
    }

    checkVerifyPasswordLength(){
        if(this.verifyPassword.length < 4){
            return false;
        } else {
            return true;
        }
    }

    passwordLengthWarning(){
        return 'Password must be 4 characters long.';
    }


    comparePasswords(){
        if(this.password.localeCompare(this.verifyPassword) != 0){
            return false;
        } else {
            return true;
        }
    }

    comparePasswordsWarning(){
        return 'Passwords must match.';
    }

    checkDegree(){
        if(this.degree.localeCompare('none') == 0){
            return false;
        } else {
            return true;
        }
    }

    degreeWarning(){
        return 'Degree must be selected.';
    }

    checkPhoneNumber(){
        if(this.phoneNumber.length < 10){
            return false;
        } else {
            return true;
        }
    }

    phoneNumberWarning(){
        return 'Phone number must be at least 10 digits.';
    }


}

module.exports = RegistrationInfo;