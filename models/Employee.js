const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    aadhar: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    skill: {
      type: Number,
      required: true,
      default: 0,
    },
    role: {
      type: String,
      required:true,
      default:"genral"
    },
    Department: {
      type: String,
      required: true,
      default: "Genral"
    },
    performance: {
      type: Number,
      default: 0
    },

    totalShifts:{
      type:Number,
      default:0
    },

    userName: {
      type: String,
      required: [true, "Please enter your Username!"],
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [4, "Password should be greater than 4 characters"],
      select: false,
    },

    shifts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Production",
        required: true,
        default: [],
      },
    ],
    wastages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Wastage",
        required: true,
        default: [],
      },
    ],

    totalWastage: {
      type: Number,
      default: 0
    },
    totalProduction: {
      type: Number,
      default: 0
    },


  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", EmployeeSchema);

module.exports = Employee;