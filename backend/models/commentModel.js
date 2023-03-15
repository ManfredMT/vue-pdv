const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    videoId:{
        type: String,
        required:true
    },
    username: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }  
},{
    timestamps: true,
})

module.exports = mongoose.model('Comment', commentSchema);