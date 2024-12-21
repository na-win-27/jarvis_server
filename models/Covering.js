const mongoose = require("mongoose");


const CoveringSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        elasticOrdered: {
            type: [
                {
                    id: {
                        type: mongoose.Types.ObjectId,
                        ref: "Elastic",
                    },
                    quantity: { type: Number, required: true, default: 0 },
                },
            ],
            required: true,
            default: []
        },
        status: {
            type: String,
            default: "open"
        },
        closedBy: {
             type: String,default:""
        },
        completedDate: {
            type: Date,
            default:Date.now()
        },

        job: {
            type: mongoose.Types.ObjectId,
            ref: "jobOrder",
        }

    },
    { timestamps: true }
);

const Covering = mongoose.model("Covering", CoveringSchema);
module.exports = Covering;