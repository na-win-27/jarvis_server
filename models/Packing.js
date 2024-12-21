const mongoose = require('mongoose');


const PackingSchema = new mongoose.Schema(
    {

        date: {
            type: Date,
            required: true,
        },
        elastic: {

            type: mongoose.Types.ObjectId,
            ref: "Elastic",
        },

        quantity: {
            type: Number,
            default: 500,
        },

        weight: {
            type: Number,
            default: 20,
        },
        noOfJoints: {
            type: Number,
            default: 10,
        }
        ,
        packedBy: {
            type: mongoose.Types.ObjectId,
            ref: "Employee",
        },
        checkedBy: {

            type: mongoose.Types.ObjectId,
            ref: "Employee",
        },

        job: {
            type: mongoose.Types.ObjectId,
            ref: "jobOrder",
        }


    },
    { timestamps: true }
);

const Packing = mongoose.model("packing", PackingSchema);
module.exports = Packing;