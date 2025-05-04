import {Router} from 'express';
import {
    login,
    register,
    logout,
    refreshAccessToken
} from "../controllers/auth.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();


//unsercured routes
router.post('/register', register);
router.post('/login', login);

//secured routes

router.post('/logout', verifyJWT,logout);
router.post('/refresh-token', verifyJWT,refreshAccessToken);

export default router;