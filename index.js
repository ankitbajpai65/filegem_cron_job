const express = require('express');
const FileModel = require('./models/file');
const handleDbConnection = require('./connection');
const cron = require('node-cron');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const credentials = require('./credentials.json');

dotenv.config();

const app = express();

// DATABASE CONNECTION

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const databaseURL = process.env.DATABASE;
handleDbConnection(databaseURL);

async function authorize() {
    const jwtClient = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        SCOPES
    )
    await jwtClient.authorize();
    return jwtClient;
}

async function deleteFileFromDrive(authClient, googleDriveId) {
    console.log('deleteFileFromDrive runs')
    try {
        const drive = google.drive({ version: 'v3', auth: authClient });

        await drive.files.delete({ fileId: googleDriveId });
    } catch (error) {
        console.log("Error deleting file from google drive:", error);
    }
}

cron.schedule('20 23 * * *', async () => {
    try {
        console.log("cron jobs ran at middleware")
        const authClient = await authorize();

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // const twentyFourHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

        // const files = await FileModel.find({ uploadDate: { $lt: twentyFourHoursAgo } }, "googleDriveId");
        const files = await FileModel.find({ uploadDate: { $gte: twentyFourHoursAgo } }, "googleDriveId");
        console.log(files)

        files.forEach((file) => deleteFileFromDrive(authClient, file.googleDriveId))
    } catch (error) {
        console.error('Error deleting files:', error);
    }
});

cron.schedule('21 23 * * *', async () => {
    try {
        console.log("cron jobs ran at controller")

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // const twentyFourHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

        // const files = await FileModel.find({ uploadDate: { $lt: twentyFourHoursAgo } });
        const files = await FileModel.find({ uploadDate: { $gte: twentyFourHoursAgo } });
        console.log(files);

        await FileModel.deleteMany({ uploadDate: { $gte: twentyFourHoursAgo } })
    } catch (error) {
        console.error('Error deleting files:', error);
    }
});

const port = process.env.PORT || 6500;

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});