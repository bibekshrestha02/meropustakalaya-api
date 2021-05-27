const asyncMiddleware = require('../middlerware/asyncMiddleware');
const { Carousal, carouselValidation } = require('../models/carouselModel');
exports.updateCarousel = asyncMiddleware(async (req, res) => {
  const { error } = carouselValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const { name, subDetail, detail, price, priceLabel } = req.body;
  let carousel = await Carousal.findOne({});
  if (carousel) {
    carousel = await Carousal.updateOne(
      {},
      {
        name,
        subDetail,
        detail,
        price,
        priceLabel,
      }
    );
  } else {
    carousel = await Carousal.create({
      name,
      subDetail,
      detail,
      price,
      priceLabel,
    });
  }

  carousel = await Carousal.findOne({});
  res.status(201).json({
    status: 'success',
    data: carousel,
  });
});

exports.getCarousel = asyncMiddleware(async (req, res) => {
  let carousel = await Carousal.findOne({}).lean();
  carousel._id = undefined;
  carousel.__v = undefined;
  res.status(200).json({
    status: 'success',
    data: carousel,
  });
});
