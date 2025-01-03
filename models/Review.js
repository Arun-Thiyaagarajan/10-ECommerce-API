import { Schema, model } from "mongoose";
import { BadRequestError } from "../errors/index.js";


const ReviewSchema = Schema({
    rating: {
        type: Number,
        required: [true, 'Please provide rating'],
        min: 1,
        max: 5,
    },
    title: {
        type: String,
        required: [true, 'Please provide review title'],
        minlength: 3,
        maxlength: [100, 'No more than 100 characters'],
    },
    comment: {
        type: String,
        required: [true, 'Please provide review comment'],
        minlength: 3,
        maxlength: [1000, 'No more than 1000 characters'],
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: Schema.ObjectId,
        ref: 'Product',
        required: true,
    },
}, { timestamps: true });

// Only One Product Review per User
ReviewSchema.index(
    { product: 1, user: 1 },
    { unique: true }
);

ReviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 },
            }
        }
    ]);

    try {
        await this.model('Product').findOneAndUpdate(
            { _id: productId },
            {
                averageRating: Math.ceil(result[0]?.averageRating) || 0,
                numOfReviews: result[0]?.numOfReviews || 0,
            }
        );
    } catch (error) {
        throw new BadRequestError('Something went wrong');
    }
}

ReviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product);
});

/**
 * The { document: true, query: false } options in Mongoose middleware explicitly control, 
 * when the middleware should run. By default, Mongoose middlewares can operate 
 * on either document instances (like reviewInstance.deleteOne()) or queries (like Review.deleteOne({})). 
 * If you don't specify these options, Mongoose defaults to applying the middleware to query-based operations.
 * NOTE: You only need these options in middlewares for operations like deleteOne or updateOne
 */
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
    await this.constructor.calculateAverageRating(this.product);
});

export default model('Review', ReviewSchema);


/**
 * If deleteOne is query based ({ document: false, query: true }), then
 * 
 * In controller: 
 * await Review.deleteOne({ _id: "someId" });
 * 
 * In Model:
 * ReviewSchema.post('deleteOne', { document: false, query: true }, async function () {
    const filter = this.getFilter(); // Get the query filter
    const doc = await this.model.findOne(filter); // Fetch the document matching the query
    if (doc) {
        await this.model('Review').calculateAverageRating(doc.product);
    }
});
 */