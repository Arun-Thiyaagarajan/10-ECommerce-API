import { Router } from "express";
import { authenticateUser } from "../middleware/authentication.js";
import { createReview, deleteReview, getAllReviews, getSingleReview, updateReview } from "../controllers/reviewController.js";


const router = new Router();

router
    .route('/')
    .post(authenticateUser, createReview)
    .get(getAllReviews);

router
    .route('/:id')
    .get(getSingleReview)
    .patch(authenticateUser, updateReview)
    .delete(authenticateUser, deleteReview);

export default router;