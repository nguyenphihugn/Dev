var express = require("express");
var router = express.Router();
var fishingRodModel = require("../schemas/fishingRod");
var Cart = require('../model/cart');

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
  console.log(fishingRod);
  res.status(200).send(fishingRod);
});

// router.get("/addtocart/:id", async function (req, res, next) {
//   var fishingRod = await fishingRodModel.findById(req.params.id).exec();
//   res.status(200).send(fishingRod);
// });



router.post("/", async function (req, res, next) {
  try {
    let newFishingRod = new fishingRodModel({
      name: req.body.name,
      year: req.body.year,
      link3D: req.body.link3D,
      price: req.body.price,
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


// // Chỉnh sửa router để sử dụng các hàm trên
// router.post("/addtocart/:id", async function (req, res, next) {
//   await addToCart(req, res);
  
// });

router.get("/addtocart/:id", async function(req, res, next) {
  var fishingRodId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  
  try {
    var fishingRod = await fishingRodModel.findById(req.params.id).exec();
    console.log(fishingRod);
    if (!fishingRod) {
      return res.status(404).send({ message: 'Không tìm thấy sản phẩm' });
    }
    
    cart.add(fishingRod, fishingRodId);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.status(200).send({ message: 'Sản phẩm đã được thêm vào giỏ hàng' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng' });
  }
});



// Hàm xử lý thêm sản phẩm vào giỏ hàng
async function addToCart(req, res) {
 
  // Lấy thông tin sản phẩm từ request
  const fishingRodId = req.params.id;

  // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ hàng
  let cart = req.session.cart || [];
  
  const existingProductIndex = cart.findIndex(item => item.id === fishingRodId);
  console.log(existingProductIndex);
  console.log(fishingRodId);
  // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
  if (existingProductIndex === -1) {
    cart.push({
      id: fishingRodId,
      quantity: 1, // Khởi tạo số lượng mặc định là 1
    });
    
  } else {
    // Nếu sản phẩm đã có, tăng số lượng
    cart[existingProductIndex].quantity++;
   
  }

  // Cập nhật giỏ hàng vào session
  req.session.cart = cart;
  console.log(req.session.cart);
  // Gửi phản hồi thành công
 
  res.status(200).send({ message: 'Sản phẩm đã được thêm vào giỏ hàng' });
  
}

// Hàm lấy danh sách sản phẩm trong giỏ hàng
function getCartItems(req) {
  return req.session.cart;
}



// Route mới để lấy danh sách sản phẩm trong giỏ hàng
router.get("/cart", function (req, res, next) {
  const cartItems = getCartItems(req);
  // console.log("Cart items:", cartItems);
  res.status(200).send(cartItems);
});



module.exports = router;



// // Route mới để lấy danh sách sản phẩm trong giỏ hàng
// router.get("/cart", function (req, res, next) {
//   const cartItems = getCartItems(req);
//   res.status(200).send(cartItems);
// });














module.exports = router;
