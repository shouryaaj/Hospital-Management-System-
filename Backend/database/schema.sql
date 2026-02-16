-- Database Schema for Life Care Hospital (PostgreSQL)

-- Enable UUID extension if we want to use UUIDs, but sticking to SERIAL for simplicity matching typical migrations unless specified.
-- Using SERIAL for IDs.

-- Users Table
-- capturing Admin, Patient, Doctor common fields
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL CHECK (length(first_name) >= 3),
    last_name VARCHAR(100) NOT NULL CHECK (length(last_name) >= 2),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL CHECK (length(phone) = 10), -- validation says exact 10
    aadhar VARCHAR(20) NOT NULL UNIQUE CHECK (length(aadhar) = 12),
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Others')),
    password VARCHAR(255) NOT NULL, -- hashed
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Patient', 'Doctor')),
    
    -- Security fields
    login_attempts INTEGER DEFAULT 0,
    lock_until TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Profiles Table (1:1 relation for Doctor specific details)
-- Normalizes doctrDptmnt and doctrAvatar
CREATE TABLE doctor_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    avatar_public_id VARCHAR(255),
    avatar_url VARCHAR(255)
);

-- Appointments Table
-- Normalized: Removed redundant patient/doctor names/emails. Relies on FKs.
-- retained 'address' because it was absent in userSchema
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    appointment_date TIMESTAMP NOT NULL, -- Converted String to TIMESTAMP for correctness
    department VARCHAR(100) NOT NULL, -- Could be redundant if doctor has one dept, but kept as per schema
    
    has_visited BOOLEAN DEFAULT FALSE,
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
-- Standalone contact form submissions
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL CHECK (length(first_name) >= 3),
    last_name VARCHAR(100) NOT NULL CHECK (length(last_name) >= 3),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL CHECK (length(phone) = 10),
    message TEXT NOT NULL CHECK (length(message) >= 10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Logs Table
CREATE TABLE security_logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    email VARCHAR(255), -- captured even if user doesn't exist?
    ip VARCHAR(50),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
