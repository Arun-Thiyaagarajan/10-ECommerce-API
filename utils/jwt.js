import jwt from 'jsonwebtoken';

const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
    return token;
}

const isTokenValid = ({ token }) => (jwt.verify(token, process.env.JWT_SECRET));

const attachCookiesToResponse = ({res, user}) => {
    // attach cookies to response
    const token = createJWT({ payload: user });

    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie('token', token, {
        expires: new Date(Date.now() + oneDay),
        httpOnly: true, // secure cookie only on HTTPS
        secure: process.env.NODE_ENV === 'production',
        signed: true,
    });
}

export {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
};