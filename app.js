const express = require("express");
const ErrorHandler = require("./middleware/error.js");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");




const user = require("./api/user.js")
const customer = require("./api/customer.js");
const rawMaterial = require("./api/rawMaterial.js")
const elastic = require('./api/elastic.js');
const order = require('./api/order.js')
const job = require('./api/job.js')
const machine = require('./api/machine.js')
const employee = require('./api/employee.js')
const shift = require('./api/shift.js')
const wastage = require('./api/wastage.js')
const production = require('./api/production.js')
const warping = require('./api/warping.js')
const packing = require('./api/packing.js')
const covering = require('./api/covering.js')



const corsConfig = {
  origin: true,
  credentials: true,
  
  
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));


app.use("/api/v2/user", (req, res, next) => {
  console.log("Hi");

  next()
}, user);

app.use("/api/v2/customer", (req, res, next) => {

  console.log("Hi cust");

    console.log(req.method)
  

  next()
}, customer);

app.use("/api/v2/rawMaterial", (req, res, next) => {
  console.log("Hi");

  next()
}, rawMaterial);

app.use("/api/v2/elastic", (req, res, next) => {
  console.log("Hi ");

  next()
}, elastic);

app.use("/api/v2/order", (req, res, next) => {
  console.log("order ");

  next()
}, order);


app.use("/api/v2/job", (req, res, next) => {
  console.log("job ");

  next()
}, job);


app.use("/api/v2/employee", (req, res, next) => {
  console.log("employee ");

  next()
}, employee);



app.use("/api/v2/machine", (req, res, next) => {
  console.log("machine ");

  next()
}, machine);


app.use("/api/v2/shift", (req, res, next) => {
  console.log("shift");

  next()
}, shift);

app.use("/api/v2/wastage", (req, res, next) => {
  console.log("was");

  next()
}, wastage);


app.use("/api/v2/production", (req, res, next) => {
  console.log("prod");
  next()
}, production);


app.use("/api/v2/warping", (req, res, next) => {
  console.log("prod");
  next()
}, warping);




app.use("/api/v2/covering", (req, res, next) => {
  console.log("covering");
  next()
}, covering);




app.use("/api/v2/packing", (req, res, next) => {
  console.log("prod");
  next()
}, packing);






// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: ".env",
  });
}


// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;