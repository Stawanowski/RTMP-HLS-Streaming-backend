const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const http = require("http")
const socketIo = require("socket.io")

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');
const { spawn } = require('child_process');
const { db } = require('./utils/db');

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});const chatRouter = require('./api/chat/chat.routes')(io)

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(express.json());
app.use('/api/v1/chat', chatRouter);
app.use(morgan('dev'));
app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded())
app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
  });
});




app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);




module.exports = {app, httpServer} ;
