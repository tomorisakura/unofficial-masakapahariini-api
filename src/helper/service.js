const axios = require('axios');

const Service = {
    fetchService : async (url, res) => {
        try {
            const response = await axios(url);
            return new Promise((resolve, reject) => {
                if(response.status === 200) resolve(response);
                reject(response);
            });
        } catch (error) {
            res.send({
                status : false,
                code : 404,
                message : "BAD REQUEST !"
            });
            throw error;
        }
    }
};

module.exports = Service;