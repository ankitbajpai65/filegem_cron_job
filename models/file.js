const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    googleDriveId: {
        type: String,
        required: true
    },
    fileSize: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const FileModel = mongoose.model('File', fileSchema);

module.exports = FileModel;
