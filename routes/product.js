const express = require('express');
const router = express.Router();
const { uploadProductImage } = require('../config/multerConfig');
const { 
    createProduct ,
    getProducts,
    getProductByName,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../controllers/product');

router.post('/', uploadProductImage, createProduct);
router.get('/', getProducts);
router.get('/name/:name', getProductByName);
router.get('/:id', getProductById);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;