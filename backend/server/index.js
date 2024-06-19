const express = require("express");
const app = express();
const colors = require("colors");
const userData = require('../config/router/userData')
require("dotenv").config();


var cors = require("cors");
app.use(cors());

const port = process.env.PORT;

//middleware
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/v1.0/userData/", userData);

app.listen(port, () => {
    console.log(`Server running on PORT ${port}...🚀`.cyan.underline.bold);
});
