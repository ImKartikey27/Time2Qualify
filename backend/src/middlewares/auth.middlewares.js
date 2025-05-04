import jwt from "jsonwebtoken"
import Admin from "../models/admin.models.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJWT = asyncHandler(async (req, _ , next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1]

    if(!token){
        throw new ApiError(401, "Unauthorized")
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const admin = await Admin.findById(decodedToken?.id).select("-password -refreshToken") 
        if(!admin) throw new ApiError(401, "Unauthorized")
        req.admin = admin
        next()
    } catch (error) {
        throw new ApiError(401,error?.message, "Invalid access token")
    }
})