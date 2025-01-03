import { model, Schema } from "mongoose";
import isEmail from "validator/lib/isEmail.js";
import bcrypt from "bcryptjs";


const UserScehma = Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, 'Please provide a email address'],
        validate: {
            validator: isEmail,
            message: 'Please enter a valid email address',
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    }
});

UserScehma.pre('save', async function () { 
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserScehma.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

export default model('User', UserScehma);