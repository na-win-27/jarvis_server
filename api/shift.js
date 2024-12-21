const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const JobOrder = require("../models/JobOrder.js");
const ShiftDetail = require("../models/ShiftDetail.js");
const Machine = require("../models/Machine.js");
const Production = require("../models/Production.js");
const Order = require("../models/Order.js");
const Employee = require("../models/Employee.js");




router.post(
  "/create-shift",

  catchAsyncErrors(async (req, res, next) => {
    try {

      const job = await JobOrder.findById(req.body.job);

      const shift = await ShiftDetail.create({
        date: req.body.date,
        shift: req.body.shift,
        description: req.body.description,
        employee: req.body.employee,
        job: req.body.job,
        machine: job.machine,
        status: "open"
      });

      job.shiftDetails.push(shift._id);
      console.log("added shift");
      
      await job.save();
      res.status(201).json({
        success: true,
        shift,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);


router.post('/enter-shift-production', catchAsyncErrors(async (req, res, next) => {
  try {

    const shift = await ShiftDetail.findById(req.body.id);

    shift.production = req.body.production;
    shift.feedback = req.body.feedback;
    shift.status = "closed";

    const job = await JobOrder.findById(shift.job);
    const machine = await Machine.findById(shift.machine);

    machine.elastics.forEach(e => {
      const i = job.producedElastic.findIndex((p) => p.id.toString() == e.toString());

      if (i >= 0) {
        job.producedElastic[i].quantity += req.body.production;
      }

    });


    const production = await Production.create({
      date: Date.now(),
      machine: machine._id,
      order: job.order,
      employee: shift.employee,
      shift: shift.shift,
      production: machine.NoOfHead * req.body.production
    })


    const emp = await Employee.findById(shift.employee);
    emp.shifts.push(production._id);
    emp.totalProduction += machine.NoOfHead * req.body.production;

    emp.performance = emp.totalWastage / emp.totalProduction;



    await machine.save();
    await shift.save();
    await emp.save();

    await job.save();
    res.status(201).json({
      success: true,
      shift,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error, 400));
  }
})
)



router.get(
  "/all-open-shifts",

  catchAsyncErrors(async (req, res, next) => {
    try {

      const shifts = await ShiftDetail.find({ status: 'open' }).populate('employee').populate('machine').populate('job').exec();

      res.status(201).json({
        success: true,
        shifts,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/shiftDetail",

  catchAsyncErrors(async (req, res, next) => {
    try {


      const shift = await ShiftDetail.findById(req.query.id).populate('employee').populate('job').exec();




      const machine = await Machine.findById(shift.machine).populate('elastics').exec();



      res.status(201).json({
        success: true,
        data: {
          id: shift._id,
          status:shift.status,
          date: shift.date,
          shift: shift.shift,
          description: shift.description,
          production: shift.production,
          employee: shift.employee.name,
          customer: shift.job.customer,
          jobNo: shift.job.jobOrderNo.toString(),
          machine: machine.ID,
          noOfHeads: machine.NoOfHead,
          noOfHooks: machine.NoOfHooks,
          elastics: machine.elastics.map((e) => { return { id: e._id, name: e.name } })
        }
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);




router.get(
  "/employee-open-shifts",

  catchAsyncErrors(async (req, res, next) => {
    try {

      const shifts = await ShiftDetail.find({ status: 'open', employee: req.query.id }).populate('employee').populate('machine').populate('job').exec();

      res.status(201).json({
        success: true,
        shifts,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);


router.get(
  "/employee-closed-shifts",

  catchAsyncErrors(async (req, res, next) => {
    try {

      const shifts = await ShiftDetail.find({ status: 'closed', employee: req.query.id }).sort({createdAt:-1}).limit(30).populate('employee').populate('machine').populate('job').exec();

      res.status(201).json({
        success: true,
        shifts,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);


module.exports = router;