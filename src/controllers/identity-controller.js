const User = require("../models/User");
const generateTokens = require("../utils/generateToken");
const logger = require("../utils/logger")
const { validateRegistration } = require("../utils/validation")


// user registration
const registerUser=async(req,res)=>{
    try {
        logger.info("hits the registration endpoint")
        // validate the schema 
        const{error}=validateRegistration(req.body);
        if (error) {
            logger.warn('Validation error',error.details[0].message)
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            })
        }
        const {username,email,password}=req.body;
        let user=await User.findOne({$or :[{email},{username}]});
        if (user) {
            logger.warn("User already exists",error.details[0].message)
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
        const {accessToken,refreshToken}=await generateTokens();
        res.status(200).json({
            success : true,
            message : "User registered successfully",
            accessToken,
            refreshToken
        })
    } catch (error) {
        logger.error("Registration error occured :",error)
    }
}
// user login

// refresh token

// logout


module.exports={registerUser}