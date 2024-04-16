var express = require("express");
var router = express.Router();
var itemModel = require("../schemas/item");
require("express-async-errors");

router.get("/", async function (req, res, next) {
  let limit = req.query.limit ? req.query.limit : 4;
  let page = req.query.page ? req.query.page : 1;
  var queries = {};
  var exclude = ["sort", "page", "limit"];
  var stringFilter = ["name", "author"];
  var numberFilter = ["year"];
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
  items = await itemModel
    .find(queries)
    .populate({ path: "author", select: "_id name" })
    .lean()
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  res.status(200).send(items);
});
router.get("/:id", async function (req, res, next) {
  var item = await itemModel.findById(req.params.id).exec();
  res.status(200).send(item);
});

router.post("/", async function (req, res, next) {
  try {
    let newitem = new itemModel({
      name: req.body.name,
      year: req.body.year,
      author: req.body.author,
    });
    await newitem.save();
    res.status(200).send(newitem);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    var item = await itemModel
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      })
      .exec();
    res.status(200).send(item);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var item = await itemModel
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
    res.status(200).send(item);
  } catch (error) {
    res.status(404).send(error);
  }
});
module.exports = router;



