import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { SecurityLog } from "../models/securityLog.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    role,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !aadhar ||
    !dob ||
    !role
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already registered with this email!", 400));
  }

  user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    aadhar,
    role,
  });
  generateToken(user, "User Registered", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  console.log('Login attempt:', { email, role, hasPassword: !!password, hasConfirmPassword: !!confirmPassword });
  
  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please provide all details!", 400));
  }
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password and Confirm Password Do not Match!", 400));
  }

  const user = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");
  console.log('User found:', user ? { email: user.email, role: user.role, requestedRole: role } : 'No user');

  // If user not found, log and return generic error
  if (!user) {
    await SecurityLog.create({ type: 'failed-login', email, ip: req.ip, message: 'User not found' });
    return next(new ErrorHandler("Invalid Password or Email!", 400));
  }

  // Check lock
  const now = Date.now();
  if (user.lockUntil && user.lockUntil.getTime() > now) {
    console.log('Login blocked: account locked', { email, until: user.lockUntil.toISOString() });
    await SecurityLog.create({ type: 'failed-login', email, ip: req.ip, user: user._id, message: 'Account locked' });
    return next(new ErrorHandler(`Account locked until ${user.lockUntil.toISOString()}`, 403));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
    const LOCK_TIME_MS = Number(process.env.ACCOUNT_LOCK_TIME) || 15 * 60 * 1000;

    const before = user.loginAttempts || 0;
    user.loginAttempts = before + 1;
    console.log('Invalid password', { email, attempts: user.loginAttempts, MAX_ATTEMPTS, LOCK_TIME_MS });
    if (user.loginAttempts >= MAX_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      await SecurityLog.create({ type: 'account-lock', email, ip: req.ip, user: user._id, message: 'Account locked due to too many failed attempts' });
      console.log('Account locked', { email, until: user.lockUntil.toISOString() });
      // Persist lock state then immediately inform client with lock timestamp
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler(`Account locked until ${user.lockUntil.toISOString()}`, 403));
    } else {
      await SecurityLog.create({ type: 'failed-login', email, ip: req.ip, user: user._id, message: 'Invalid password' });
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler("Invalid Password or Email!", 400));
    }
  }

  if (role !== user.role) {
    await SecurityLog.create({ type: 'failed-login', email, ip: req.ip, user: user._id, message: 'Role mismatch' });
    return next(new ErrorHandler("User with this role not found!", 400));
  }

  // Successful login
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save({ validateBeforeSave: false });
  await SecurityLog.create({ type: 'successful-login', email, ip: req.ip, user: user._id, message: 'User login' });

  generateToken(user, "User Login Successfully", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, aadhar, dob } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !aadhar ||
    !dob
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegisterd = await User.findOne({ email });
  if (isRegisterd) {
    return next(
      new ErrorHandler(
        `${isRegisterd.role} with this email already exists!`,
        400
      )
    );
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    role: "Admin",
  });
  res.status(200).json({
    success: true,
    message: "New Admin Registered!",
  });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
  };

  res.status(200).cookie("adminToken", "", cookieOptions).json({
    success: true,
    message: "Admin Logged Out Successfully!",
  });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
  };

  res.status(200).cookie("patientToken", "", cookieOptions).json({
    success: true,
    message: "Patient Logged Out Successfully!",
  });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor avatar required!", 400));
  }

  const { doctrAvatar } = req.files;

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(doctrAvatar.mimetype)) {
    return next(new ErrorHandler("File format not supported!", 400));
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    doctrDptmnt,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !aadhar ||
    !dob ||
    !doctrDptmnt
  ) {
    return next(new ErrorHandler("Please provide full details", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} already registered with this email!`,
        400
      )
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    doctrAvatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary Error"
    );
  }

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    role: "Doctor",
    doctrDptmnt,
    doctrAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered!",
    doctor,
  });
});
