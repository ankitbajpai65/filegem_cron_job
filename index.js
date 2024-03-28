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
    try {
        const drive = google.drive({ version: 'v3', auth: authClient });

        await drive.files.delete({ fileId: googleDriveId });
    } catch (error) {
        console.log("Error deleting file from google drive:", error);
    }
}

// cron.schedule('21 15 * * *', async () => {
//     console.log("cron-job runs")
//     const authClient = await authorize();

//     const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
//     // const twentyFourHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

//     const files = await FileModel.find({ uploadDate: { $gte: twentyFourHoursAgo } });
//     console.log(files)

//     files.forEach((file) => deleteFileFromDrive(authClient, file.googleDriveId))

//     await FileModel.deleteMany({ uploadDate: { $gte: twentyFourHoursAgo } })
// })

app.get("/", (req, res) => {
    res.send("Welcome to filegem cron-job server")
})

app.delete("/deleteFiles", async(req, res) => {
    try {
        const authClient = await authorize();

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // const twentyFourHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

        const files = await FileModel.find({ uploadDate: { $gte: twentyFourHoursAgo } });
        console.log(files)

        files.forEach((file) => deleteFileFromDrive(authClient, file.googleDriveId))

        await FileModel.deleteMany({ uploadDate: { $gte: twentyFourHoursAgo } })

        res.json({
            status: "ok",
            message: "File uploaded before 24 hours are deleted!"
        })
    } catch (error) {
        console.log(error)
        res.json({
            status: "error",
            error
        })
    }
})

const port = process.env.PORT || 6500;

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});