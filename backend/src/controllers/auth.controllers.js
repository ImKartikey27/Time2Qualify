import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import Admin from "../models/admin.models";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = asyncHandler(async (admin_id) => {
    const admin = await Admin.findById(admin_id);
    if (!admin) {
        throw new ApiError("User not found", 404);
    }
    const accessToken = admin.generateAccessToken(admin_id);
    const refreshToken = admin.generateRefreshToken(admin_id);
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
})

const register = asyncHandler(async (req, res) => {
    const {
        username,
        email,
        password,
        name,
        role,
        secretKey,
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !name || !role) {
        throw new ApiError("Please provide all required fields", 400);
    }

    // Check for existing user
    const existingUser = await Admin.findOne({
        $or: [
            { username },
            { email }
        ]
    });
    if (existingUser) {
        throw new ApiError("Username or email already exists", 400);
    }

    // Secret key check for admin role
    if (role === "admin") {
        if (!secretKey) {
            throw new ApiError("Please provide secret key", 400);
        }
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            throw new ApiError("Invalid secret key", 400);
        }
    }

    // Create user
    await Admin.create({
        username,
        email,
        password,
        name,
        role,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
        throw new ApiError("Please provide all required fields", 400);
    }

    // Check for existing user
    const admin = await Admin.findOne({ username }).select("+password");
    if (!admin) {
        throw new ApiError("Invalid credentials", 401);
    }

    // Check password
    const isPasswordCorrect = await admin.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError("Invalid credentials", 401);
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(admin._id)
    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new ApiResponse(200, {accessToken, refreshToken}, "Login successful"))
})

const logout = asyncHandler(async (req, res) => {
    await Admin.findOneAndUpdate(
        req.admin._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {new: true}
    )
    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, "Logout successful"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh Token is required")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const admin = await Admin.findById(decodedToken?.id).select("-password")
        if(!admin) throw new ApiError(401, "Unauthorized")
        if(incomingRefreshToken!== admin?.refreshToken) throw new ApiError(401, "Invalid refresh token")
        
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(admin._id)
        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(new ApiResponse(200, {accessToken, refreshToken}, "Access token refreshed successfully"))
    } catch (error) {
        console.log("refresh Token", error);
        
        throw new ApiError(401, "Something went wrong while refreshing access token")
    }
})

export {
    register,
    login,
    logout,
    refreshAccessToken,
    generateAccessAndRefreshToken
}