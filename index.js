const express = require('express');
const route = require('./src/route/index');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(route);
const port = process.env.port || 3000;

app.listen(port, () => {
    try {
        console.log(`Running on ${port} without you 😥`);
    } catch (error) {
        throw error;
    }
});