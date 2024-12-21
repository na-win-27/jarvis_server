const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const router = express.Router();
const Elastic = require("../models/Elastic.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const RawMaterial = require("../models/RawMaterial.js");
const Costing = require("../models/Costing.js");

// create product
router.post(
  "/create-elastic",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const elasticData = req.body;
      console.log(elasticData)

      const ar = [];

      let pcost = 0;
      const cover = await RawMaterial.findById(elasticData.spandexCovering.id);
      const rubber = await RawMaterial.findById(elasticData.warpSpandex.id);
      const weft = await RawMaterial.findById(elasticData.weftYarn.id);

      pcost += cover.price * elasticData.spandexCovering.weight / 1000;

      ar.push({
        material: cover.name,
        price: cover.price * elasticData.spandexCovering.weight / 1000,
        materialPrice: cover.price ,
        weight:elasticData.spandexCovering.weight 
      })

      pcost += rubber.price * elasticData.warpSpandex.weight / 1000;

      ar.push({
        material: rubber.name,
        price: rubber.price * elasticData.warpSpandex.weight / 1000,
        materialPrice: rubber.price ,
        weight:elasticData.warpSpandex.weight 
      })


      pcost += weft.price * elasticData.weftYarn.weight / 1000;

      ar.push({
        material: weft.name,
        price: weft.price * elasticData.weftYarn.weight / 1000,
        materialPrice: weft.price ,
        weight:elasticData.weftYarn.weight 
      })



      elasticData.warpYarn.forEach(async wa => {

        const warp = await RawMaterial.findById(wa.id);


        pcost += warp.price * wa.weight / 1000;

        ar.push({
          material: warp.name,
          price: warp.price * wa.weight / 1000,
          materialPrice: warp.price ,
          weight:wa.weight 
        })
      });


      const elastic = await Elastic.create({
        'name': elasticData.name,
        'warpSpandex': elasticData.warpSpandex,

        'warpYarn': elasticData.warpYarn,
        'spandexCovering': elasticData.spandexCovering,
        "spandexEnds": elasticData.spandexEnds,
        'yarnEnds': 264,
        'weftYarn': elasticData.weftYarn,
        'pick': Number(elasticData.pick),
        'noOfHook': Number(elasticData.noOfHook),
        'customer': elasticData.customer,
        'weight': Number(elasticData.weight),
        'testingParameters': {
          'width': Number(elasticData.width),
          'elongation': Number(elasticData.elongation),
          'recovery': Number(elasticData.recovery),
          'strech': Number(elasticData.strech),
          'image': elasticData.image
        }
      })
      console.log(elastic);


      const cos = await Costing.create({
        date: Date.now(),
        elastic: elastic._id,
        materialCost: pcost,
        details: ar
      })

      elastic.costing = cos._id;

      await elastic.save();


      res.status(201).json({
        success: true,
        elastic,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error, 400));
    }
  })
);


router.get(
  "/get-elastics",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const elastics = await Elastic.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        elastics,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/getElasticDetail",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const elastic = await Elastic.findById(req.query.id)
        .populate('warpSpandex.id')
        .populate('spandexCovering.id')
        .populate('weftYarn.id')
        .populate('warpYarn.id')
      
        .exec();


      res.status(201).json({
        success: true,
        elastic,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


module.exports = router;