import { model, Schema, Types } from "mongoose";


const ProductSchema = Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        minlength: 3,
        maxlength: [100, 'No more than 100 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a product price'],
        default: 0,
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [1000, 'No more than 1000 characters'],
    },
    image: {
        type: String,
        default: '/uploads/example.jpeg',
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['office', 'bedroom', 'kitchen'],
    },
    company: {
        type: String,
        required: [true, 'Please provide a company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} is not a valid company name',
        },
    },
    colors: {
        type: [String],
        default: ['#eeeeee'],
        required: [true, 'Please provide at least one color'],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    freeShipping: {
        type: Boolean,
        default: false,
    },
    inventory: {
        type: Number,
        required: true,
        default: 15,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false,
    // match: { rating: 5 }
});

ProductSchema.pre('remove', async function (next) {
    await this.model('Review').deleteMany({product: this._id});
});

export default model('Product', ProductSchema);