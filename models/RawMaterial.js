const mongoose = require("mongoose");



const RawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    supplier: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
    },
    category:{
      type:String,
      required:true,
    },
    purchases:[{
      type: mongoose.Types.ObjectId, 
      ref: "PurchaseOrder"
    }],
    grammage:{
      type: Number, 
      required:true,
      default:0.05
    },
    price:{
      type: Number,
      required:true
    },
    minStock:{
      type:Number,
      required:true,
      default:100
    },
    materialsInward:
    {
      type:[],
    default:[]
    },
    stockMovements:{
      type:[],
      default:[]
    },
    totalConsumption:{
      type:Number,
      default:0,
    },

  },
  { timestamps: true }
);

const RawMaterial = mongoose.model("RawMaterial", RawMaterialSchema);
module.exports=RawMaterial;