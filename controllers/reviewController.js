import { StatusCodes } from "http-status-codes";
import Review from "../models/Review.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import Product from "../models/Product.js";
import { checkPermissions } from "../utils/checkPermissions.js";


const createReview = async (req, res) => {
    const { product: productId } = req.body;
    const isValidProuct = await Product.findOne({ _id: productId });

    if (!isValidProuct) {
        throw new BadRequestError('Invalid product id');
    }

    const alreadyReviewed = await Review.findOne({
        product: productId,
        user: req.user.userId
    });

    if (alreadyReviewed) {
        throw new BadRequestError('You have already reviewed this product');
    }

    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({ review });
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate({
        path: 'product',
        select: 'name company price'
    });
    res.status(StatusCodes.OK).json({ reviews, totalCount: reviews.length });
}

const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
        throw new NotFoundError('Review not found');
    }

    res.status(StatusCodes.OK).json({ review });
}

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;
    
    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
        throw new NotFoundError('Review not found');
    }
    checkPermissions(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();

    res.status(StatusCodes.OK).json({ review });
}

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
        throw new NotFoundError('Review not found');
    }

    checkPermissions(req.user, review.user);
    await review.deleteOne();

    res.status(StatusCodes.OK).json({ msg: 'Review Deleted' });
}

const getSingleProductReviews = async (req, res) => { 
    const { id: productId } = req.params;
    const reviews = await Review.find({ product: productId });
    res.status(StatusCodes.OK).json({ reviews, totalCount: reviews.length });
}

export {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
}