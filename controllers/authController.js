import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import { attachCookiesToResponse, createJWT } from "../utils/jwt.js";
import { createTokenUser } from "../utils/createTokenUser.js";

const register = async (req, res) => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('Email already exists');
    }

    // First registered user is the admin
    const isFirstAccount = await User.countDocuments({}) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({ ...req.body, role: role });
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser});

    res.status(StatusCodes.CREATED).json({ user: tokenUser });
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError('Please provide the required fields');
    }
    const user = await User.findOne({ email });
    if (!user ||!(await user.comparePassword(password))) {
        throw new UnauthenticatedError('Invalid credentials');
    }
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser});

    res.status(StatusCodes.OK).json({ user: tokenUser });
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.status(StatusCodes.NO_CONTENT).send();
}

export {
    register,
    login,
    logout,
}