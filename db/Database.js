const mongoose = require("mongoose");

const AutoIncrementFactory = require('mongoose-sequence');
const RawMaterial = require("../models/RawMaterial");

let db;
const connectDatabase = async () => {
    db = await mongoose
        .connect(process.env.MONGO_URL, {

        })
        .then((data) => {

            console.log(`mongod connected with server: ${data.connection.host}`);
        }); 
        
};





module.exports = { connectDatabase, db };