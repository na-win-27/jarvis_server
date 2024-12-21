const express = require("express");
const { isAuthenticated,isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const Machine = require("../models/Machine.js");




router.post(
  "/create-machine",
  
  catchAsyncErrors(async (req, res, next) => {
    try {
      const machineData = req.body;
      const machine = await Machine.create(machineData);
      res.status(201).json({
        success: true,
        machine,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
    "/get-machines",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
      try {
        const machines = await Machine.find().populate('orderRunning').exec()
      console.log(machines)
        res.status(201).json({
          success: true,
          machines,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );

module.exports=router
