const express = require('express')
const app = express()
const router = require('./router/router')
// MIDDLEWARES 
const cors = require('cors')
const bodyparser = require('body-parser')
// DATABASE CONNECTION
const mongoose = require('mongoose');
const uri = 'mongodb+srv://Hari:Harikishore@cluster0.bjl2j.mongodb.net/register?retryWrites=true&w=majority'

const port = 3000

class Server{
    constructor()
    {
        this.initExpressMiddleware();
        this.initDB();
        this.initRoutes();
        this.start();
    }

    initExpressMiddleware()
    {
        app.use(bodyparser.json());
        app.use(bodyparser.urlencoded({extended: false}));
        app.use(cors());
    }

    initDB()
    {
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("mongodb connected...")
        })
        .catch( err => console.log(err))
    }

    initRoutes()
    {
        app.use('/', router)
    }

    start()
    {
        app.listen(port, ()=>console.log(`Server runs on ${port}`))
    }

}

new Server()