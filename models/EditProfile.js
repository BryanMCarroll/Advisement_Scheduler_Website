class EditProfile {

    constructor(email,
                firstName,
                lastName,
                UCOID,
                degree,
                phoneNumber
    ){
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.UCOID = UCOID;
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
        if(!this.checkFirstName()){
            return false;
        } else if(!this.checkLastName()){
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

module.exports = EditProfile;