import { login, logout, register } from "../controllers/authController.js";
import { Router } from "express";

const router = new Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

export default router;