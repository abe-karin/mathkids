const express = require('express');
const cors = require('cors'); 
const app = express();

const whitelist = ['http://localhost:3000', 'https://mathkids-3sz0.onrender.com/']; 


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permite os métodos que você usa
  credentials: true, // Se você usa cookies ou sessions
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));