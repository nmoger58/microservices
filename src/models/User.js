const mongoose=require('mongoose')
const argon2 = require('argon2');

// argon2 hashing function
// argon2 is a password hashing function that is designed to be secure against GPU attacks
// and is used by many modern applications for password storage.
// It is a memory-hard function that is designed to be slow and requires a lot of memory to compute,
// making it difficult for attackers to use brute-force attacks to crack passwords.

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true
})

userSchema.pre('save',async function(next){
    try {
        this.password=await argon2.hash(this.password)
    } catch (error) {
        return next(error)
    }
})

userSchema.methods.comparePassword=async function(password){
    try {
        return await argon2.verify(this.password,password)
    } catch (error) {
        throw new Error(error)
    }
}

userSchema.index({username : 'text'})

const userModel=mongoose.model('User',userSchema)
module.exports=userModel