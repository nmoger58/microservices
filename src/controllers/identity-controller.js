const refreshTokenModel = require("../models/refreshToken");
const User = require("../models/User");
const generateTokens = require("../utils/generateToken");
const logger = require("../utils/logger")
const { validateRegistration, validateLogin } = require("../utils/validation")


// user registration
const registerUser=async(req,res)=>{
    try {
        logger.info("hits the registration endpoint")
        // validate the schema 
        const{error}=validateRegistration(req.body);
        if (error && error.details) {
            logger.warn('Validation error',error.details[0].message)
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            })
        }
        logger.info('validated')
        const {username,email,password}=req.body;

        let user=await User.findOne({email});
        if (user) {
            logger.warn("User already exists")
            return res.status(400).json({
                success : false,
                message : "User already exists"
            })
        }
        user=await User.create({
            username,
            email,
            password
        })
        logger.warn("User registered successfully",user._id)
        const {accessToken,refreshToken}=await generateTokens(user);
        return res.status(200).json({
            success : true,
            message : "User registered successfully",
            accessToken,
            refreshToken,
            userId : user._id
        })
    } catch (error) {
        logger.error("Registration error occured :",error)
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}
// user login
const login=async (req,res) => {
    try {
        logger.info("Login endpoint hit....")
        const {error}=validateLogin(req.body)
        if (error && error.details) {
            logger.error(`Validation Error : ${error.details[0].message}`)
            return res.status(400).json({
                success : false,
                message : "Validation Error",
                error : error.details[0].message
            })
        }
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            logger.warn("User doesnt exists...")
            return res.status(400).json({
                success : false,
                message : "User doesnt exists"
            })
        }
        const isValidPassword=await user.comparePassword(password);
        if(!isValidPassword){
            logger.warn('Invalid password')
            return res.status(400).json({
                success : false,
                message : "Invalid Password"
            })
        }
        const {accessToken,refreshToken}=await generateTokens(user)
        logger.warn('User logged in successfully');
        return res.status(200).json({
            success : true,
            message : "User logged successfully",
            userId : user._id,
            refreshToken,
            accessToken
        })
    } catch (error) {
        logger.error(`Something went wrong , Error : ${error.message}`)
        return res.status(500).json({
            success : false,
            message : "Something went wrong"
        })
    }
}
// refresh token
const refreshTokenUser=async(req,res)=>{
    try {
        logger.info("Refresh Token endpoint hit...")
        const {refreshToken}=req.body;
        if(!refreshToken){
            logger.error("Refresh Token missing")
            return res.status(400).json({
                success : false,
                message : "Refresh token is missing"
            })
        }
        const storedToken=await refreshTokenModel.findOne({token : refreshToken})
        if(!storedToken || storedToken.expiresAt< new Date()){
            logger.warn("No refresh token is found")
            return res.status(400).json({
                success : false,
                message : "No refresh Token found"
            })
        }
        const user=await User.findById(storedToken.userId);
        if(!user){
            logger.warn("No user is using that token");
            return res.status(400).json({
                success : false,
                message : "User not found"
            })
        }
        const {accessToken : newAccessToken,refreshToken : newRefreshToken}=generateTokens(user);
        await refreshTokenModel.findByIdAndDelete(storedToken._id);
        return res.status(200).json({
            success : true,
            message : "New token generated successfully",
            accessToken : newAccessToken,
            refreshToken : newRefreshToken
        })
    } catch (error) {
        logger.error(`Something went wrong , Error : ${error.message}`)
        return res.status(500).json({
            success : false,
            message : "Something went wrong"
        })
    }
}
// logout

const logout=async(req,res)=>{
    try {
        const {refreshToken}=req.body;
        if (!refreshToken) {
            logger.warn("Refresh token is missing")
            return res.status(400).json({
                success : false,
                message : "Refresh Token is missing"
            })
        }
        await refreshTokenModel.deleteOne({token : refreshToken});
        logger.warn("User logged out successfully")
        return res.status(200).json({
            success : true,
            message : "User logged out successfully"
        })
    } catch (error) {
        logger.error(`Something went wrong , Error : ${error.message}`)
        return res.status(500).json({
            success : false,
            message : "Something went wrong"
        })
    }
}

module.exports={registerUser,login,refreshTokenUser,logout}