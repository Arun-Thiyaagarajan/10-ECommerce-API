import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { checkPermissions } from "../utils/checkPermissions.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";


const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'someSecret';
    return { client_secret, amount };
}

const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body;

    if (!cartItems || cartItems.length < 1) {
        throw new BadRequestError('No cart items provided');
    }
    if (!tax || !shippingFee) {
        throw new BadRequestError('Please provide tax and shippingFee');
    }

    let orderItems = [];
    let subTotal = 0;
    for (const item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.product });
        if (!dbProduct) {
            throw new NotFoundError('No product found');
        }
        const { name, price, image, _id } = dbProduct;
        const singleOrderItem = {
            amount: item.amount,
            name,
            image,
            price,
            product: _id,
        };
        orderItems.push(singleOrderItem);
        subTotal += (item.amount * price);
    }
    const total = subTotal + tax + shippingFee;

    // Get Client Secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd',
    });

    const order = await Order.create({
        tax,
        shippingFee,
        subTotal,
        total,
        orderItems,
        user: req.user.userId,
        clientSecret: paymentIntent.client_secret,
    });

    res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret });
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find({});

    res.status(StatusCodes.OK).json({ orders, totalCount: orders.length });
}

const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        throw new NotFoundError('Order not found');
    }
    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
}

const getCurrentUserOrder = async (req, res) => {
    const orders = await Order.find({ user: req.user.userId });

    res.status(StatusCodes.OK).json({ orders, totalCount: orders.length });
}

const updateOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const { paymentIntentId } = req.body;
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        throw new NotFoundError('Order not found');
    }
    checkPermissions(req.user, order.user);
    
    order.paymentIntentId = paymentIntentId;
    order.status = 'paid';
    await order.save();

    res.status(StatusCodes.OK).json({ order });
}

export {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrder,
    createOrder,
    updateOrder,
};