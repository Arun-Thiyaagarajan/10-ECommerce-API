import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, getSingleProduct, updateProduct, uploadImage } from "../controllers/productController.js";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.js";
import { getSingleProductReviews } from "../controllers/reviewController.js";


const router = new Router();

router
    .route('/')
    .post([authenticateUser, authorizePermissions('admin')], createProduct)
    .get(getAllProducts);
router
    .route('/uploadImage')
    .post([authenticateUser, authorizePermissions('admin')], uploadImage);
router
    .route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
    .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

router.route('/:id/reviews').get(getSingleProductReviews);

export default router;