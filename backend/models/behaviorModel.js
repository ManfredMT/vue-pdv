const mongoose = require('mongoose');

const behaviorSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    kind: {
        type: String,
        required: true,
    },
    videoList: {
        type: [String],
        required: true,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Behavior', behaviorSchema)