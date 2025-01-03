import { UnauthenticatedError } from '../errors/index.js';
import UnauthorizedError from '../errors/unauthorized.js';
import { isTokenValid } from '../utils/jwt.js';

const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token;
    if (!token) {
        throw new UnauthenticatedError('Authentication required');
    }
    try {
        const { name, userId, role } = isTokenValid({ token });
        req.user = {name, userId, role};
    } catch (error) {
        throw new UnauthenticatedError('Invalid authentication');
    }
    next();
}

// Authorize Permissions Setup (Hardcoded)
// const authorizePermissions = (req, res, next) => { 
//     if (req.user.role !== 'admin') {
//         throw new UnauthorizedError('Unauthorized to access this route');
//     }
//     next();
// }

const authorizePermissions = (...roles) => { 
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) { 
            throw new UnauthorizedError('Unauthorized to access this route');
        }
        next();
    };
}

export {
    authenticateUser,
    authorizePermissions,
}