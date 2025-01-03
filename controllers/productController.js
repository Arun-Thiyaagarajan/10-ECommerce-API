import { StatusCodes } from "http-status-codes";
import Product from "../models/Product.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createProduct = async (req, res) => {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({ product });
}

const getAllProducts = async (req, res) => {
    const products = await Product.find({});
    res.status(StatusCodes.OK).json({ products, totalCount: products.length });
}

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId }).populate('reviews');
    if (!product) {
        throw new NotFoundError('Product not found');
    }
    res.status(StatusCodes.OK).json({ product });
}

const updateProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOneAndUpdate(
        { _id: productId },
        req.body,
        { new: true, runValidators: true, }
    );
    if (!product) {
        throw new NotFoundError('Product not found');
    }
    res.status(StatusCodes.OK).json({ product });
}

const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
        throw new NotFoundError('Product not found');
    }
    await product.deleteOne();
    res.status(StatusCodes.OK).json({ msg: 'Product Deleted Successfully!' });
}

const uploadImage = async (req, res) => {
    if (!req.files) {
        throw new BadRequestError('No files to upload');
    }
    
    const productImage = req.files.image;
    if (!productImage.mimetype.startsWith('image/')) { 
        throw new BadRequestError('Invalid file type. Only images are allowed.');
    }
    const maxSize = 1024 * 1024;
    if (productImage.size > maxSize) {
        throw new BadRequestError('Image size is too large. Max size is 1MB.');
    }

    const imagePath = join(__dirname, '../public/uploads/' + `${productImage.name}`);
    await productImage.mv(imagePath);

    res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
}

export {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
};