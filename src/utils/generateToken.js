const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const refreshTokenModel = require('../models/refreshToken');

const generateTokens=async(user)=>{
    const accessToken=jwt.sign({
        userId : user._id,
        username : user.username,
    },process.env.JWT_SECRET,{expiresIn : '60m'})

    const refreshToken=crypto.randomBytes(40).toString('hex');
    const expiresAt=new Date()
    expiresAt.setDate(expiresAt.getDate()+7) // refresh token expires in 7 days
    await refreshTokenModel.create({
        token : refreshToken,
        userId : user._id,
        expiresAt
    })
    return {accessToken,refreshToken}
}

module.exports=generateTokens;