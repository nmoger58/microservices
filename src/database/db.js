const mongoose=require('mongoose');
const logger = require('../utils/logger');

const connectDB=async(port)=>{
    try {
        await mongoose.connect(port);
        logger.info("Connected to the database")
    } catch (error) {
        logger.error("Error connecting to database")
    }
}

module.exports=connectDB;