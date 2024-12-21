import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
  {
    Date: {
      type:String,
      required: true
    },
    Customer: {
      type:mongoose.Types.ObjectId,
      required: true
    },
    Order: {
      type:mongoose.Types.ObjectId,
      ref:"JobOrder",
      required: true
    },
    Status:{
      type:String,
      required: true
    },
    Reason:{
      type:String,
      required: true
    },
    Feedback:{
        type:String,
      }

  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", ComplaintSchema);
export default Complaint;