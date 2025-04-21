const express=require('express');
const connectDB = require('./database/db');
const app=express();
const helmet=require('helmet')
const cors=require('cors');
const logger = require('./utils/logger');
const {RateLimiterRedis}=require('rate-limiter-flexible')
const Redis=require('ioredis')
const {rateLimit}=require('express-rate-limit')
const {RedisStore}=require('rate-limit-redis');
const router = require('./routes/identity-service');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config()
connectDB(process.env.MONGO_URI)
const redisClient=new Redis(process.env.REDIS_URL)
app.use(helmet()) 
app.use(cors())
app.use(express.json())

app.use((req,res,next)=>{
    logger.info("Received "+req.method+" request to "+req.url)
    logger.info('Request body,'+req.body);
    next();
})
app.get('/',async(req,res)=>{
    res.send("hello")
})
// DDOs protection and rate limiting 
const ratelimiter=new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix : 'middleware',
    points : 2,
    duration : 15
})
app.use((req,res,next)=>{
    ratelimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn('Rate limit exceeded for the ip :',req.ip)
        res.status(429).json({
            success : false,
            message : "Too many requests"
        })
    })
})

// ip based ratelimiter for sensitive endpoints
const sensitiveEndpointsRateLimit=rateLimit({
    windowMs : 15*60*1000,
    max : 50,
    standardHeaders : true,
    legacyHeaders : false,
    handler :(req,res)=>{
        logger.warn("Sensitive endpoints hit rate limit exceeded : ",req.ip)
        res.status(429).json({
            success : false,
            message : "Sensitive endpoints hit rate limit exceeded"
        })
    },
    store : new RedisStore({
        sendCommand : (...args)=>redisClient.call(...args)
    })
})
// apply this sensitive endpoint limiter 
app.use('/api/auth/register',sensitiveEndpointsRateLimit)

// Routes

app.use('/api/auth',router)

// error handler
app.use(errorHandler)
app.listen(process.env.PORT,()=>{
    logger.info('Identity service Server listening on port : ',process.env.PORT)
});

// unhandled promise rejection

process.on('unhandledRejection',(reason,promise)=>{
    logger.warn('Unhandled promise rejection :',promise,'reason ',reason)
})