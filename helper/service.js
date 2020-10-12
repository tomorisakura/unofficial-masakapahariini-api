const axios = require('axios');

const Service = {
    fetchService : async (url) => {
        try {
            const response = await axios(url);
            return new Promise((resolve, reject) => {
                if(response.status === 200) resolve(response);
                reject(response);
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Service;