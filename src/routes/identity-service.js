const express=require('express');
const { registerUser, login, refreshTokenUser, logout } = require('../controllers/identity-controller');

const router=express.Router();

router.post('/register',registerUser);
router.post('/login',login)
router.post('/refreshToken',refreshTokenUser)
router.post('/logout',logout)
module.exports=router;