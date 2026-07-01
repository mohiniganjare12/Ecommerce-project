const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, getFeatured, getCategories
} = require('../controllers/productController');

const upload = multer({ dest: 'uploads/' });

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
