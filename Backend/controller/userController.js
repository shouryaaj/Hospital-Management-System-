import { sequelize } from "../database/dbConnection.js";
import { QueryTypes } from "sequelize";
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

  let user = await User.findOne({ where: { email } });
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

// --- VULNERABLE login (VAPT lab): raw SQL via string concatenation ---
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  const q = `SELECT * FROM "Users" WHERE email = '${email}' AND password = '${password}'`;
  console.log("Executing SQL:", q);
  const rows = await sequelize.query(q, { type: QueryTypes.SELECT });
  if (!rows || rows.length === 0) {
    return next(new ErrorHandler("Invalid Password or Email!", 400));
  }
  const user = await User.findByPk(rows[0].id);
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

  const isRegisterd = await User.findOne({ where: { email } });
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
  const doctors = await User.findAll({ where: { role: "Doctor" } });
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

  const isRegistered = await User.findOne({ where: { email } });
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
    doctrAvatar_public_id: cloudinaryResponse.public_id,
    doctrAvatar_url: cloudinaryResponse.secure_url,
  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered!",
    doctor,
  });
});