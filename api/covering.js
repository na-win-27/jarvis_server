const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const router = express.Router();
const RawMaterial = require("../models/RawMaterial.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const Warping = require("../models/Warping.js");
const Employee = require("../models/Employee.js");
const Covering = require("../models/Covering.js");

router.get(
    "/get-open-covering",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const covering = await Covering.find({ status: 'open' }).populate('job').exec();
            res.status(200).json({
                success: true,
                covering,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);
router.get(
    "/get-closed-covering",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const covering = await Covering.find({ status: 'closed' }).populate('job').exec();
            res.status(200).json({
                success: true,
                covering,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);


router.get(
    "/get-covering-detail",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            console.log("gk");
            
            const covering = await Covering.findById(req.query.id).populate('job').populate('elasticOrdered.id').populate('closedBy').exec();
            console.log(covering);
            
            res.status(200).json({
                success: true,
                covering,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);


router.post(
    "/covering-completed",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const covering = await Covering.findById(req.body.id);

            covering.status = "closed";
            covering.closedBy = req.body.closedBy;

            covering.completedDate = Date.now();

            await covering.save();

            res.status(201).json({
                success: true,
                covering,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);


router.post(
    "/login-employee",
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { userName, password } = req.body;

            console.log(password);


            if (!userName || !password) {
                return next(new ErrorHandler("Please provide the all fields!", 400));
            }

            const employee = await Employee.findOne({ userName }).select("+password");





            if (!employee) {
                return next(new ErrorHandler("User doesn't exists!", 400));
            }
            if (employee.password == password && employee.Department == "covering") {
                //   const token = generateToken(employee);

                //   console.log(token);



                res
                    .status(201)
                    .json({
                        username: employee.name,
                        id: employee._id,
                        role: employee.role,
                        totalWastage: employee.totalWastage,
                        totalProduction: employee.totalProduction,
                        skill: employee.skill,
                        Department: employee.Department,
                        aadhar: employee.aadhar,
                        totalShifts: employee.totalShifts,

                        //   token: token,

                    });
            } else {
                res.status(401).json({ message: "Invalid Credentials" });
            }
        }

        catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

module.exports = router;