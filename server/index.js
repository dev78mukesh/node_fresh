const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config/config');
const connection = require('./connection/connect');
const route = require('./route');
const app = express();
const morgan = require('morgan')
const socket = require('../server/sockets/index');
const cronJob=require('../server/v1/cron/cronjobs');

const server = require('http').createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use('/api', route);
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, '../server/uploads/')));

app.use(express.static((path.join(__dirname,"../server/swagger"))));
const io = require('socket.io')(server)
socket(io)
connection.connect().then(success => {
  server.listen(config.port, () => {
        console.log(`Running on port ${config.port}.`);
        console.log(success);
    });
}).catch(error => {
    console.log('Db not connected!')
});

cronJob.startCronJobs();
