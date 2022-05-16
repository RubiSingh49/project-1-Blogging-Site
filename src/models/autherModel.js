const mongoose = require('mongoose');
const autherSchema = new mongoose.Schema({

        firstName: {
                type: String,
                required: true,
                trim: true
        },

        lastName: {
                type: String,
                required: true,
                trim: true
        },

        title: {
                type: String,
                required: true,
                enum: ["Mr", "Mrs", "Miss"],
                trim: true
        },

        email: {
                type: String,
                unique: true,
                trim: true,
                match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
                lowercase: true
        },

        password: {
                type: String,
                required: true,
                trim: true,
                match: [/^[a-zA-Z0-9!@#$%^&*]{8,15}$/, 'Please fill a valid password']
        }

}, { timestamps: true });


module.exports = mongoose.model('Auther', autherSchema) 
