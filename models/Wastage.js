const mongoose = require('mongoose');

const WastageSchema = new mongoose.Schema(
  {
    elastic: {
      type: mongoose.Types.ObjectId,
      ref: "Elastic",
      required: true
    },
    job: {
      type: mongoose.Types.ObjectId,
      ref: "jobOrder",
      required: true
    },
    employee: {
      type: mongoose.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status:{
      type:String,
      required:true,
      default:"open"
    }
  },
  { timestamps: true }
);

const Wastage = mongoose.model("Wastage", WastageSchema);
module.exports = Wastage