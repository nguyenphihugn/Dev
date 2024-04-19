const mongoose = require('mongoose');

var fishingRodSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    year: Number,
    link3D: String,
    price: Number,
    author: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'author'
    },

    isDeleted:{
        type:Boolean,
        default:false
    }

}, { timestamps: true })
module.exports = new mongoose.model('fishingRod', fishingRodSchema)