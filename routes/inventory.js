const express = require('express');
const router = express.Router();

// Require controller modules
 const instrumentController = require("../controller/instrumentController"); 
 const categoryController = require("../controller/categoryController"); 

/* INSTRUMENT ROUTES */

// Base route
router.get('/', instrumentController.getIndex);

router.get('/instrument/create', instrumentController.getInstrumentCreateForm);
router.post('/instrument/create', instrumentController.postInstrumentCreateForm);

router.get('/instrument/:id/update', instrumentController.getInstrumentUpdateForm);
router.post('/instrument/:id/update', instrumentController.postInstrumentUpdateForm);

router.get('/instrument/:id/delete', instrumentController.getInstrumentDeleteForm);
router.get('/instrument/:id/delete', instrumentController.postInstrumentDeleteForm);

router.get('/instrument/:id/', instrumentController.getInstrumentDetails);
router.get('/instruments', instrumentController.getInstrumentsList);

/* CATEGORY ROUTES */

router.get('/category/create', categoryController.getCategoryCreateForm);
router.post('/category/create', categoryController.postCategoryCreateForm);

router.get('/category/:id/update', categoryController.getCategoryUpdateForm);
router.post('/category/:id/update', categoryController.postCategoryUpdateForm);

router.get('/category/:id/delete', categoryController.getCategoryDeleteForm);
router.get('/category/:id/delete', categoryController.postCategoryDeleteForm);

router.get('/category/:id/', categoryController.getCategoryDetails);

module.exports = router;
