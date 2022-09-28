const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const helmet = require('helmet');
const Ddos = require('ddos');
const ddos = new Ddos;
const path = require('path');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

mongoose.connect(process.env.DB_URL,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
 
app.use(express.json());
app.use(ddos.express);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(helmet());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);



module.exports = app;