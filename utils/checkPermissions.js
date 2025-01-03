import UnauthorizedError from "../errors/unauthorized.js";


const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === 'admin') return;
    // NOTE: typeof resourceUserId is Object
    if (requestUser.userId === resourceUserId.toString()) return;

    throw new UnauthorizedError('Unauthorized to access this resource');
}

export {
    checkPermissions,
}