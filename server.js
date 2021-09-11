const dotenv = require('dotenv');
dotenv.config({path: './config/.env'});
const app = require('./app');

const port = process.env.PORT;

const server = app.listen(port, function(err) {
    if (err) console.log("Error in server setup")
    console.log("Server listening on port", port);
});