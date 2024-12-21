import mongoose from "mongoose";


const PurchaseOrderSchema = new mongoose.Schema(
  {
    Date: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    Elastic: {
      type:[
        {
          id:{
            type: mongoose.Types.ObjectId, 
            ref: "Elastic"
          },
          quantity:{type:Number},
        }
      ],
      required: true,
    },
    customer: {
      type:mongoose.Types.ObjectId, 
      ref: "Supplier",
      required: true,
    },
    SupplyDate: {
      type:String,
      required: true,
    },
    OrderNo: {
        type:String,
        required: true,
      },
  },
  { timestamps: true }
);

const PurchaseOrders = mongoose.model("PurchaseOrders", PurchaseOrderSchema);
export default PurchaseOrders;