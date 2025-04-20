const winston=require('winston');

const logger=winston.createLogger({
    level : process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format : winston.format.combine(
        winston.format.timestamp(),  // adds a timestamp for each log
        winston.format.errors({stack : true}), // logs error stacks for better debugging
        winston.format.splat(), // allows using placeholders like %s
        winston.format.json() // makes log structured and machine readable
    ),
    defaultMeta : {
        service : 'identity-service'
    }, // adds this metadata to every log message indicating which service the log is from
    transports : [
        new winston.transports.Console({
            format : winston.format.combine(
                winston.format.colorize(),
            winston.format.simple()
            )
        }), // show logs in your terminal 
        // adds color and makes it readable for humans
    new winston.transports.File({filename : 'error.log',level :'error'}),
    // writes only error-level logs to error.log
    new winston.transports.File({filename : 'combined.log'})
   // log all levels (debug,info,warn,error)    
]
})

module.exports=logger;