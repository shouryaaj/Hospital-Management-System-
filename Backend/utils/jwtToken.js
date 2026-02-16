export const generateToken = (user, message, statusCode, res)=>{
    const token = user.generateJsonWebToken();
    const cookieName = user.role === "Admin" ? "adminToken" : "patientToken";
    const cookieOptions = {
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // Only send secure cookies in production
        secure: process.env.NODE_ENV === 'production',
        // Strict in production to reduce CSRF; Lax for local/dev convenience
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
    };

    res.status(statusCode).cookie(cookieName, token, cookieOptions).json({
        success: true,
        message,
        user,
        token
    })

}