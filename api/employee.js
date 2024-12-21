const express = require("express");

const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const Employee = require("../models/Employee.js");

const router = express.Router();



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
        if (employee.password==password ) {
        //   const token = generateToken(employee);
  
        //   console.log(token);
          
          
          res
            .status(201)
            .json({
              username: employee.name,
              id:employee._id,
              role: employee.role,
              totalWastage:employee.totalWastage,
              totalProduction:employee.totalProduction,
              skill:employee.skill,
              Department:employee.Department,
              aadhar:employee.aadhar,
              totalShifts:employee.totalShifts,
              
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

// create product
router.post(
    "/create-employee",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const employee = await Employee.create(req.body);

            res.status(201).json({
                success: true,
                employee,
            });
        } catch (error) {
            console.log(error);
            return next(new ErrorHandler(error, 400));
        }
    })
);


router.get(
    "/get-employee-detail",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const employee = await Employee.find({ _id: req.query.id }).sort({
                createdAt: -1,
            }).populate({
                path: 'shifts',
                options: {
                    limit: 6,
                    sort: { created: -1 },
                }
            }).populate({
                path: 'wastages',
                options: {
                    limit: 6,
                    sort: { created: -1 },
                }
            }).exec();
           
            res.status(201).json({
                success: true,
                employee,
            });
        } catch (error) {
            console.log(error);
            return next(new ErrorHandler(error, 400));
        }
    })
);

router.get(
    "/get-employee-weave",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const employees = await Employee.find({ 'Department': 'weaving' }).sort({
                createdAt: -1,
            });
            res.status(201).json({
                success: true,
                employees,
            });
        } catch (error) {
            console.log(error);
            return next(new ErrorHandler(error, 400));
        }
    })
);


router.get(
    "/get-employees",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const employees = await Employee.find().sort({
                createdAt: -1,
            });
            res.status(201).json({
                success: true,
                employees,
            });
        } catch (error) {
            console.log(error);
            return next(new ErrorHandler(error, 400));
        }
    })
);

router.get(
    "/get-employee-checking",
    // isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const employees = await Employee.find({ 'Department': 'checking' }).sort({
                createdAt: -1,
            });
            res.status(201).json({
                success: true,
                employees,
            });
        } catch (error) {
            console.log(error);
            return next(new ErrorHandler(error, 400));
        }
    })
);





module.exports = router;