const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc  Get all products with filter, sort, search, pagination
// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip  = (page - 1) * limit;

    const query = { isActive: true };

    // Regex search — works without a text index
    if (req.query.search) {
      const r = { $regex: req.query.search, $options: 'i' };
      query.$or = [
        { name: r }, { description: r },
        { brand: r }, { category: r }, { tags: r },
      ];
    }

    if (req.query.category) query.category = req.query.category;
    if (req.query.brand)    query.brand    = req.query.brand;
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.rating) query.rating = { $gte: Number(req.query.rating) };

    const sortOptions = {
      newest:       { createdAt: -1 },
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      popular:      { sold: -1 },
      rating:       { rating: -1 },
    };
    const sort = sortOptions[req.query.sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single product
// @route GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create product (admin)
// @route POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const images = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'nexusshop' });
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }
    const product = await Product.create({ ...req.body, images });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update product (admin)
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete product (admin)
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Add / update review
// @route POST /api/products/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const Order = require('../models/Order');
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': product._id,
      isPaid: true,
    });

    const existingIndex = product.reviews.findIndex(
      r => r.user?.toString() === req.user._id.toString()
    );
    const reviewData = {
      user:             req.user._id,
      name:             req.user.name,
      rating:           Number(req.body.rating),
      comment:          req.body.comment,
      verifiedPurchase: !!hasPurchased,
    };

    if (existingIndex >= 0) product.reviews[existingIndex] = reviewData;
    else product.reviews.push(reviewData);

    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get featured products
// @route GET /api/products/featured
exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get categories
// @route GET /api/products/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};