import mongoose, { Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const adminSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    refreshToken: {
        type: String,
    },
},{
    timestamps: true,
});

adminSchema.pre("save", async function(next) {
    if(!this.isModified("password")){
        return next()
    }
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
})

adminSchema.methods.isPasswordCorrect = async function(password){
    return await bcryptjs.compare(password, this.password)
}

adminSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        id: this._id,
        username: this.username,
        email: this.email,
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    })
}

adminSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        id: this._id,
        username: this.username,
        email: this.email,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    })
}

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;