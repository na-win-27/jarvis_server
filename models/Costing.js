const mongoose=require("mongoose")
const CostingSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },
        elastic: {
            type: mongoose.Types.ObjectId,
            ref: "Elastic",
            required: true
        },
        conversionCost: {
            type: Number,
            default: 1.25,
            required: true
        },
        materialCost: {
            type: Number,
        },
        details: {
            type: [],
            default: [],
            required: true
        },

    },
    { timestamps: true }
);

const Costing = mongoose.model("Costing", CostingSchema);
module.exports= Costing;