const { validCategory, Category } = require('../models/categoryModel');
const asyncMiddleware = require('../middlerware/asyncMiddleware');
const mongoose = require('mongoose');
exports.getCategory = asyncMiddleware(async (req, res, next) => {
  let category = await Category.find({});

  res.status(200).json({
    status: 200,
    data: category,
  });
});
exports.postCategory = asyncMiddleware(async (req, res, next) => {
  const { error } = validCategory(req.body);
  const { name, title } = req.body;
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  if (await Category.findOne({ name: name })) {
    return res.status(400).json({
      type: 'name',
      message: 'category name should be unique',
    });
  }
  let category = await Category.create({
    name: name,
    title: title,
  });
  res.status(201).json({
    status: 201,
    data: category,
  });
});
exports.deleteCategories = asyncMiddleware(async (req, res, next) => {
  const { categoryIds } = req.body;
  let isValid_id = true;
  categoryIds.map(async (id) => {
    if (!mongoose.isValidObjectId(id)) {
      return (isValid_id = false);
    }
  });
  if (!isValid_id) {
    return res.status(400).json({
      name: 'id',
      message: 'Invalid category',
    });
  }
  let category = await Category.find({ _id: { $in: categoryIds } });
  if (category.length < 1) {
    return res.status(400).json({
      name: 'id',
      message: 'Invalid category',
    });
  }
  await Category.deleteMany({
    _id: { $in: categoryIds },
  });

  res.status(200).json({ message: 'sucess' });
});
exports.updateCategory = asyncMiddleware(async (req, res, next) => {
  const { category_id, name, title } = req.body;
  if (!mongoose.isValidObjectId(category_id)) {
    return res.status(400).send('Invalid category id');
  }
  let category = await Category.findById(category_id);
  if (!category) {
    return res.status(400).send('Invalid category id');
  }
  const { error } = validCategory({ name, title });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  category = await Category.findByIdAndUpdate(
    category_id,
    { name: name, title: title },
    { new: true }
  );
  res.status(200).json({
    status: 200,
    data: category,
  });
});
exports.deleteCategory = asyncMiddleware(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      name: 'id',
      message: 'Invalid category Id',
    });
  }

  let category = await Category.findById(id);
  if (!category) {
    return res.status(400).json({
      name: 'id',
      message: 'Invalid category',
    });
  }
  await Category.findByIdAndDelete(id);

  res.status(200).json({ message: 'sucess' });
});
