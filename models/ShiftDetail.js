const mongoose = require('mongoose')

const ShiftDetailSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  shift: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default:""
  },
  feedback: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    default: "open"
  },
  
  production: {
    type: Number,
    required: true,
    default: 0,
  },
  complaint: { type: mongoose.Types.ObjectId, ref: "Complaint" },
  employee: { type: mongoose.Types.ObjectId, ref: "Employee" },
  job: { type: mongoose.Types.ObjectId, ref: "jobOrder" },
  machine: { type: mongoose.Types.ObjectId, ref: "Machine" },
})

const ShiftDetail = mongoose.model("ShiftDetail", ShiftDetailSchema);
module.exports = ShiftDetail;
