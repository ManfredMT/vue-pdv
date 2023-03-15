const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    browser: {
        type: String,
    },
    platform: {
        type: String,
    },
    description: {
        type: String,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Record', recordSchema)