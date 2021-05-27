const { ValidatePackage, Package } = require('../models/packageModel');
const asyncMiddleware = require('../middlerware/asyncMiddleware');
const _ = require('lodash');
const mongoose = require('mongoose');
exports.getEnablePackage = asyncMiddleware(async (req, res) => {
  let packageData = await Package.find({ isEnable: true });
  res.status(200).json({
    status: 200,
    data: packageData,
  });
});

exports.getAllPackage = asyncMiddleware(async (req, res) => {
  let packageData = await Package.find({});
  res.status(200).json({
    status: 200,
    data: packageData,
  });
});
exports.postPackage = asyncMiddleware(async (req, res) => {
  const { error } = ValidatePackage(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let data = _.pick(req.body, [
    'name',
    'price',
    'description',
    'validityDay',
    'isEnable',
  ]);
  let package = await Package.findOne({ name: data.name });
  if (package) {
    return res.status(400).json({
      name: 'name',
      message: 'Name should be unique',
    });
  }

  data = new Package(data);
  data = await data.save();
  res.status(201).json({
    status: 201,
    data,
  });
});

exports.updatePackage = asyncMiddleware(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id) || !id) {
    return res.status(400).send('Invalid id');
  }
  const { error } = ValidatePackage(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  if (!(await Package.findById(id))) {
    return res.status(400).send('invalid package id');
  }

  const packageData = await Package.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      validityDay: req.body.validityDay,
      isEnable: req.body.isEnable,
    },

    { new: true }
  );
  res.status(200).json({
    status: 200,
    data: packageData,
  });
});

exports.deletePackage = asyncMiddleware(async (req, res) => {
  const { id } = req.params;
  await Package.findByIdAndDelete(id);
  res.status(200).send('success');
});
exports.toogleEnablePackage = asyncMiddleware(async (req, res) => {
  const { id } = req.params;

  if (!(mongoose.isValidObjectId(id) && id && (await Package.findById(id)))) {
    return res.status(400).send('Invalid id');
  }
  let packageData = await Package.findById(id);

  packageData = await Package.findByIdAndUpdate(id, {
    isEnable: !packageData.isEnable,
  });
  res.status(200).json({
    status: 200,
    data: packageData,
  });
});
