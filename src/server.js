const express=require('express');
const connectDB = require('./database/db');
const app=express();
const helmet=require('helmet')
const cors=require('cors');
const logger = require('./utils/logger');
require('dotenv').config()
connectDB(process.env.MONGO_URI)

app.use(helmet()) 
app.use(cors())

app.use(express.json())

app.use((req,res,next)=>{
    logger.info("Received "+req.method+" request to "+req.url)
    logger.info('Request body,'+req.body);
    next();
})

app.get('/',(req,res)=>{
    res.send("hello")
})

app.listen(3000);