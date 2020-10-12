const express = require('express');
const route = require('./route/index');
const cors = require('cors');
const app = express();

app.use(route);
app.use(cors());
const port = 3000;

app.listen(port, () => {
    try {
        console.log(`Running on ${port}`);
    } catch (error) {
        throw error;
    }
});