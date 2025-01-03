import { Router } from "express";
import { createOrder, getAllOrders, getCurrentUserOrder, getSingleOrder, updateOrder } from "../controllers/orderController.js";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.js";


const router = new Router();

router
    .route('/')
    .post(authenticateUser, createOrder)
    .get([authenticateUser, authorizePermissions('admin')], getAllOrders);

router
    .route('/showAllMyOrders')
    .get(authenticateUser, getCurrentUserOrder);

router
    .route('/:id')
    .get(authenticateUser, getSingleOrder)
    .patch(authenticateUser, updateOrder);

export default router;