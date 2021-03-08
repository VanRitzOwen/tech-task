const axios = require('axios');

getData = {
    "getPost": async (url) => {
        let res = await axios.get(url);
        if(res.status == 200){
            return {
                status: 200,
                data: res.data
            }
        }else{
            return {
                status: 400
            }
        }
    }
}

module.exports = getData;