const validator = require('validator');

goValid = {
    "isRegValid": (payload) => {
        if(payload && validator.isJSON(payload)){
            payload = JSON.parse(payload);
            if(payload.email && payload.password){
                return validator.isEmail(payload.email)
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
}

module.exports = goValid;