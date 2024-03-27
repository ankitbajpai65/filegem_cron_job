const mongoose = require('mongoose');

const handleDbConnection = (url) => {
    return mongoose.connect(url).then(() => {
        console.log(`Connected to the db`);
    }).catch((err) => {
        console.log(`Error : ${err}`);
    })
}

module.exports = handleDbConnection;