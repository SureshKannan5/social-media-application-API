/*main file of the application*/
const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
/**bring in  routes */
const postRoutes = require("./Routes/post");//for posts
const authRoutes = require("./Routes/authRoute");// for authentication
//apiDocs
app.get('/',(req,res)=>{
  fs.readFile("docs/apiDocs.json",(err,data)=>{
    if(err){
      res.status(400).json({
        error:err
      });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});
/*DATABSE ACCESS*/
const dotenv = require("dotenv")//connecting database
const mongoose = require("mongoose");
const bodyParser = require("body-parser");// for parsing JSON object from request(visualize JSON format)
const expressValidator = require("express-validator");//validate field
const cookieParser = require('cookie-parser')// parsing cookie header
const allUserRoutes = require("./Routes/userRoute");
dotenv.config()

//db
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB connected"))

mongoose.connection.on("error",err =>{
  console.log(`DB connection failed. ${err.message}`)
})


/* const myOwnMiddleWare = (req,res,next)=>{
    console.log("MiddleWare Applied");
    next();
} */
//middle ware
app.use(morgan("dev"));
// app.use(myOwnMiddleWare);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use(postRoutes);
app.use(authRoutes);
app.use(allUserRoutes);// show all user to user
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({error:'invalid token...'});
  }
  next();
});
const port = process.env.PORT || 8080;
app.listen(port, ()=>{
  console.log(`A node js API is listening on ${port}`);  
})
