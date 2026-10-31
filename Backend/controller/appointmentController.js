
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Appointment } from "../models/appointmentSchema.js"
import { User } from "../models/userSchema.js"

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        aadhar,
        dob,
        gender,
        appointment_date,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address
    } = req.body

    if (!firstName ||
        !lastName ||
        !email ||
        !phone ||
        !aadhar ||
        !dob ||
        !gender ||
        !appointment_date ||
        !department ||
        !doctor_firstName ||
        !doctor_lastName ||
        !address) {
        return next(new ErrorHandler("Please Fill Full Form!", 400))
    }

    const isConflict = await User.findAll({
        where: {
            firstName: doctor_firstName,
            lastName: doctor_lastName,
            role: "Doctor",
            doctrDptmnt: department
        }
    })

    if (isConflict.length === 0) {
        return next(new ErrorHandler("Doctor not found!", 404))
    }

    if (isConflict.length > 1) {
        return next(new ErrorHandler("Doctors conflict! Please contact through email or phone.", 404))
    }

    const doctorId = isConflict[0].id;
    const patientId = req.user.id;

    const appointment = await Appointment.create({
        firstName,
        lastName,
        email,
        phone,
        aadhar,
        dob,
        gender,
        appointment_date,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
        doctorId,
        patientId
    })
    res.status(200).json({
        success: true,
        message: "Appointment Sent Successfully!",
        appointment
    })

})


export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
    const appointments = await Appointment.findAll();
    res.status(200).json({
        success: true,
        appointments
    })
})


export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    let appointment = await Appointment.findByPk(id)
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404))
    }
    await appointment.update(req.body);
    res.status(200).json({
        success: true,
        message: "Appointment Status Updated!",
        appointment
    })
})


export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findByPk(id)
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404))
    }

    await appointment.destroy();
    res.status(200).json({
        success: true,
        message: "Appointment Deleted!",
    })
})