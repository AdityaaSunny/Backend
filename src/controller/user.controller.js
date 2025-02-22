import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res)=> {
    //*steps for register user
    //get user from frontend
    //(refer user model) validation - not empty wala
    //check if user already exist : username and/or email 
    //check for images
    // check for avatar
    //upload to cloudinary, avatar
    //create user object(because mongo m data no sql databases h usme objets he jate h)-create entry in db
    //remove password and reference token from response
    //check for user creation 
    //return response

    const{fullName, email, username, password}=req.body
    // console.log("email: " , email);

    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are Required")
    }


    const existedUser= await User.findOne({
        $or: [{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        coverImage:coverImage?.url || "",
        avatar: avatar.url,
        username: username.toLowerCase()
    })


    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    const response = new ApiResponse(200, createdUser, "User Registered Successfully");
    return res.status(201).json(response);
   
    })

export {
    registerUser,
}