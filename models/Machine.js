const mongoose = require("mongoose");


const MachineSchema = new mongoose.Schema(
  {
    ID: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,

    },
    DateOfPurchase: {
      type: String,
    },
    NoOfHead: {
      type: Number,
      required: true,
    },
    NoOfHooks: {
      type: Number,
      required: true,
    },
    elastics: [{
      type: mongoose.Types.ObjectId,
      ref: "Elastic"
    },],

    status:{
      type: String,
      required: true,
      default:"free"
    }
,
    orderRunning: {
      type: mongoose.Types.ObjectId,
      ref: "jobOrder",
      default: null
    },

    complaints: [{
      type: mongoose.Types.ObjectId,
      ref: "Complaint"
    },],
  },
  { timestamps: true }
);

const Machine = mongoose.model("Machine", MachineSchema);


module.exports = Machine;