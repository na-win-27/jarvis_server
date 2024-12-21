const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const router = express.Router();
const Order = require("../models/Order.js");
const Elastic = require("../models/Elastic.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const RawMaterial = require("../models/RawMaterial.js");
const axios = require("axios");




const JobOrder = require("../models/JobOrder.js");
const ShiftDetail = require("../models/ShiftDetail.js");
const Wastage = require("../models/Wastage.js");
const { default: Production } = require("../models/Production.js");
const Machine = require("../models/Machine.js");
const Employee = require("../models/Employee.js");
const Warping = require("../models/Warping.js");
const Covering = require("../models/Covering.js");
// create product



router.post(
  "/create-job",
  // isAuthenticated,

  catchAsyncErrors(async (req, res, next) => {
    try {

      console.log("job post")
      const date = req.body.date;
      const status = req.body.status;
      const order = req.body.order;
      const elastics = req.body.elastics;
      const customer = req.body.customer;

      const elas = elastics.map((e) => {
        const r =
        {
          id: e.id,
          quantity: e.quantity
        };
        if (e.quantity > 0) {
          return r
        }

      });

      const _elas = elas.filter(function (el) {
        return el != null;
      });


      const producedElastic = elastics.map((e) => {
        const r =
        {
          id: e.id,
          quantity: 0
        };
        if (e.quantity > 0) {
          return r
        }

      });

      const _producedElastic = producedElastic.filter(function (el) {
        return el != null;
      });


      const wastageElastic = elastics.map((e) => {
        const r =
        {
          id: e.id,
          quantity: 0
        };

        if (e.quantity > 0) {
          return r
        }
      });

      const _wastageElastic = wastageElastic.filter(function (el) {
        return el != null;
      });




      const packedElastic = elastics.map((e, i) => {
        const r =
        {
          id: e.id,
          quantity: 0
        };

        if (e.quantity > 0) {
          return r
        }

      });


      const _packedElastic = packedElastic.filter(function (el) {
        return el != null;
      });





      const j = await JobOrder.create({
        date: Date(date),
        elastics: _elas,
        packedElastic: _packedElastic,
        producedElastic: _producedElastic,
        wastageElastic: _wastageElastic,
        customer: customer,
        status: status,
        order: order,
      });


      const orderDoc = await Order.findById(order);


      elastics.map((e) => {
        const i = orderDoc.producedElastic.findIndex((x) => x.id == e.id);
        const x = orderDoc.pendingElastic.findIndex((x) => x.id == e.id);
        orderDoc.producedElastic[i].quantity += e.quantity;
        orderDoc.pendingElastic[x].quantity -= e.quantity;
      })

      orderDoc.jobs.push({ id: j._id, no: j.jobOrderNo });

      await orderDoc.save();

      res.status(201).json({

        success: true,

      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/get-warpingDetails",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const warp =  await Warping.findById(req.query.id).populate('job').populate('elasticOrdered.id').exec();
      console.log(warp);

      res.status(201).json({
        success: true,
        warp
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/get-warpingCompleted",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const warp = await Warping.findById(req.query.id)

      warp.status = "closed";

      console.log("closed");


      await warp.save();
      res.status(201).json({
        success: true,
        warp
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/get-jobOrderDetail",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const jobOrder = await Promise.resolve(JobOrder.findById(req.query.id)
        .populate('elastics.id').populate('shiftDetails').populate('warping').
        populate('covering').populate('shiftDetails').populate('machine').
        exec());


      const elastics = jobOrder.elastics.map((e, i) => {
        const name = e.id.name;
        const id = e.id.id;

        const packed = jobOrder.packedElastic.find((x) => x.id == id);

        const wastage = jobOrder.wastageElastic.find((x) => x.id == id);

        const produced = jobOrder.producedElastic.find((x) => x.id == id);

        return {
          id: id,
          name: name,
          ordered: e.quantity,
          produced: produced.quantity,
          wastage: wastage.quantity,
          packed: packed.quantity,
          machine: jobOrder.machine,
          shiftDetails: jobOrder.shiftDetails,

        }
      })


      const checking = jobOrder.checking ? jobOrder.checking : "Not Assigned"

      const warping = jobOrder.warping ? jobOrder.warping : "Not Assigned"

      const covering = jobOrder.covering ? jobOrder.covering : "Not Assigned"
      const machine = jobOrder.machine ? jobOrder.machine : "Not Assigned"

      res.status(201).json({
        success: true,
        jobOrder: {
          _id: jobOrder._id,
          jobOrderNo: jobOrder.jobOrderNo.toString(),
          date: jobOrder.date,
          status: jobOrder.status,
          shiftDetails: jobOrder.shiftDetails,
          customer: jobOrder.customer,
          elastics: elastics,
          order: jobOrder.order,
          elastics: elastics,
          checking: checking,
          warping: warping,
          covering: covering,
          machine: machine
        }
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/approveInventory",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const jobOrder = await Promise.resolve(JobOrder.findById(req.query.id));



      const warping = await Warping.create({
        date: Date.now(),
        elasticOrdered: jobOrder.elastics,
        job: req.query.id
      });

      const covering = await Covering.create({
        date: Date.now(),
        elasticOrdered: jobOrder.elastics,
        job: req.query.id
      });

      jobOrder.warping = warping;
      jobOrder.covering = covering;

      jobOrder.status = "warping&covering"



      await jobOrder.save();
      res.status(201).json({
        success: true,
        jobOrder
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/runningJobs",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const jobs = await Promise.resolve(JobOrder.where({
        status: {
          $not: {
            $eq: "closed"
          }
        }
      }))

      res.status(201).json({
        success: true,
        jobs
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);



router.get(
  "/get-coveringDetail",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const covering =await Covering.findById(req.query.id).populate('job').populate('elasticOrdered.id').exec();

      res.status(201).json({
        success: true,
        covering
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/get-coveringCompleted",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const covering = await Covering.findById(req.query.id)

      covering.status = "closed";

      covering.completedDate = Date.now();

      console.log("closed");


      await covering.save();


      res.status(201).json({
        success: true,
        covering
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/get-markWeavingCompleted",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const job = await JobOrder.findById(req.query.id)

      job.status = "finishing";

      const machine = await Machine.findById(job.machine);
      machine.status = "free";
      machine.orderRunning = null;
      await machine.save()


      console.log("finishing");


      await job.save();


      res.status(201).json({
        success: true,
        job
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/get-markFinishingCompleted",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const job = await JobOrder.findById(req.query.id)

      job.status = "packing";



      console.log("QC");


      await job.save();


      res.status(201).json({
        success: true,
        job
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);



router.get(
  "/get-markCheckingCompleted",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const job = await JobOrder.findById(req.query.id)
      job.status = "packing";
      await job.save();
      res.status(201).json({
        success: true,
        job
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/get-markPackingCompleted",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const job = await JobOrder.findById(req.query.id)
      job.status = "closed";
      await job.save();
      res.status(201).json({
        success: true,
        job
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);



router.post(
  "/weavingPlan",
  // isAuthenticated,

  catchAsyncErrors(async (req, res, next) => {
    try {

      console.log("weave post")
      const jobId = req.body.jobId;
      const machineId = req.body.machineId;

      const elastics = req.body.elastics;

      const job = await JobOrder.findById(jobId);
      job.machine = machineId;
      job.status = "weaving"

      await job.save();

      const machine = await Machine.findById(machineId);
      machine.elastics = elastics;
      machine.orderRunning = jobId;
      machine.status = "running"

      await machine.save();


      res.status(201).json({
        machine,
        job,
        success: true,

      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.post(
  "/checkingAssign",
  // isAuthenticated,

  catchAsyncErrors(async (req, res, next) => {
    try {


      const jobId = req.body.jobId;
      const employeeId = req.body.employee;



      const job = await JobOrder.findById(jobId);

      job.checking = employeeId;

      await job.save();




      res.status(201).json({
        success: true,

      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);
module.exports = router;