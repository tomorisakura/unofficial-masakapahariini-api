const express = require('express');
const route = require('./src/route/index');
const cors = require('cors');
const app = express();

app.use(route);
app.use(cors());
const port = process.env.port || 3000;

app.listen(port, () => {
    try {
        console.log(`Running on ${port} without you 😥`);
    } catch (error) {
        throw error;
    }
});