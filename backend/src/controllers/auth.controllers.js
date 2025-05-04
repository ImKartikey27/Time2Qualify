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
