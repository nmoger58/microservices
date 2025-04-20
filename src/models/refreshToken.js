const mongoose=require('mongoose')

const refreshTokenSchema=new mongoose.Schema({
    token :{
        type:String,
        required:true,
        unique:true
    },
    userId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    expiresAt :{
        type:Date,
        required:true
    },
},
{
    timestamps:true
})

refreshTokenSchema.index({expiresAt : 1}, {expireAfterSeconds : 0}) // automatically delete expired tokens from the database

const refreshTokenModel=mongoose.model('RefreshToken',refreshTokenSchema)
module.exports=refreshTokenModel