var express = require("express");
var router = express.Router();
var fishingRodModel = require("../schemas/fishingRod");
require("express-async-errors");

router.get("/", async function (req, res, next) {
  let limit = req.query.limit ? req.query.limit : 4;
  let page = req.query.page ? req.query.page : 1;
  var queries = {};
  var exclude = ["sort", "page", "limit"];
  var stringFilter = ["name", "author"];
  var numberFilter = ["year"];
  //{ page: '1', limit: '5', name: 'Hac,Ly', author: 'Cao' }
  for (const [key, value] of Object.entries(req.query)) {
    if (!exclude.includes(key)) {
      if (stringFilter.includes(key)) {
        queries[key] = new RegExp(value.replace(",", "|"), "i");
      } else {
        if (numberFilter.includes(key)) {
          let string = JSON.stringify(value);
          let index = string.search(new RegExp("lte|gte|lt|gt", "i"));
          if (index < 0) {
            queries[key] = value;
          } else {
            queries[key] = JSON.parse(
              string.slice(0, index) + "$" + string.slice(2, string.length)
            );
          }
        }
      }
    }
  }
  console.log(queries);
  queries.isDeleted = false;
  fishingRods = await fishingRodModel
    .find(queries)
    .populate({ path: "author", select: "_id name" })
    .lean()
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  res.status(200).send(fishingRods);
});
router.get("/:id", async function (req, res, next) {
  var fishingRod = await fishingRodModel.findById(req.params.id).exec();
  res.status(200).send(fishingRod);
});

router.post("/", async function (req, res, next) {
  try {
    let newFishingRod = new fishingRodModel({
      name: req.body.name,
      year: req.body.year,
      link3D: req.body.link3D,
      author: req.body.author,
    });
    await newFishingRod.save();
    res.status(200).send(newFishingRod);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    var fishingRod = await fishingRodModel
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      })
      .exec();
    res.status(200).send(fishingRod);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var fishingRod = await fishingRodModel
      .findByIdAndUpdate(
        req.params.id,
        {
          isDeleted: true,
        },
        {
          new: true,
        }
      )
      .exec();
    res.status(200).send(fishingRod);
  } catch (error) {
    res.status(404).send(error);
  }
});
module.exports = router;
