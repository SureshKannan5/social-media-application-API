const {sendEmail} = require("../helpers/helpers")
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");// for authentication to display posts
const _ = require("lodash");
require("dotenv").config();
exports.signup = async (req,res)=>{
    const userExist = await User.findOne({email: req.body.email});
    if(userExist) return res.status(403).json({
        error:"User email already exist.please try signin"
    })
    const user = await new User(req.body);
    await user.save();
    res.status(200).json({
       message:"Signup sucessful.please signin with login"
    })
}
exports.signin = (req,res)=>{
    //find user name based on email.
    const {email,password} = req.body;
    User.findOne({email},(err,user)=>{
        // if err or no user
        if(err || !user){
            return res.status(401).json({
                error:"Enter email id doesn't exists.please signup using this email"
            })
        }
        //if user found make sure the email and password should match
        //create authentication method in model and use here
        if(!user.authentication(password))
        {
            return res.status(401).json({
                error:"Password is incorrect"
            })
        }
        //generate a token with user id and secret
        //to generate a cookie for authentcation on next when user login it's auto login
        const token = jwt.sign({_id:user._id,role:user.role},process.env.JWT_SECRET);
        //persist the token as 't' in cookie with expiary data
        res.cookie("t",token,{expairy: new Date()+9999})
        // return response with user and token to fornt end client
        const {_id,name,email,role} = user
        return res.json({
            token,
            user:{_id,email,name,role}
        });

    })
}
// signout
exports.signout = (req,res)=>{
    res.clearCookie('t');
    return res.json({ message:"signout sucessful"})

}
//check sign in for displaying posts.
exports.requireSignin = expressJWT({
    //if the token is valid express jwt appends the verfied user by id 
    // in an auth key to the request object
    secret:process.env.JWT_SECRET,
    algorithms: ['HS256'],
    userProperty :"auth"
});
// forgot password and Reset password
exports.forgotPassword = (req,res)=>{
    if(!req.body) return res.status(400).json({message:"No request body"})
    if(!req.body.email) return res.status(400).json({message:"No E-mail in the requested body"})
    const {email} = req.body;
    User.findOne({email},(err,user)=>{
        if(err || !user)
         {
            return res.status(401).json({error:"Entered email doesn't exsist"})
        }
   
    const token = jwt.sign({
        _id:user._id,
        iss:"NODE-API"
    },process.env.JWT_SECRET);
    const emailData = {
        from:"noreply@node-react.com",
        to:email,
        subject:"Password Reset Instruction",
        text:`Please use the following link to reset your password:${process.env.CLIENT_URL}reset-password/${token}`,
        html:`<p>Please use the following link to reset Password:</p> <p>${process.env.CLIENT_URL}reset-password/${token}`
    };

    return user.updateOne({
        resetPasswordLink: token
    },(err,sucess)=>{
        if(err){
            return res.json({message:err})
        }
        else{
            sendEmail(emailData);
            return res.status(200).json({
                message:`E-mail has been send to ${email}. follow the Instruction to reset your password`
            })
        }
    })
});
}
exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    User.findOne({ resetPasswordLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status('401').json({
                error: 'Invalid Link!'
            });

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ''
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};

exports.socialLogin = (req,res) => {
    let user = User.findOne({email:req.body.email} , (err,user) =>{
       // create a user and login
       if(err || !user)
       {
       user = new User(req.body);
       req.profile = user;
       user.save();
       // generate a toke with user id and secret
       const token = jwt.sign({
        _id:user._id,
        iss:"NODE-API"
    },process.env.JWT_SECRET); 
    res.cookie("t",token,{expire:new Date()+9999});
    // return response with user and token
    const { _id,name,email} = user;
    return res.json({
        token,
        user:{ _id,name,email}
    })
}
else{
    // Update existing user with new social account information
    req.profile = user;
    user = _.extend(user,req.body);
    user.updated = Date.now();
    user.save();
      // generate a toke with user id and secret 
      const token = jwt.sign({
        _id:user._id,
        iss:"NODE-API"
    },process.env.JWT_SECRET);
    res.cookie("t",token,{expire:new Date()+9999});
    // return response with user and token
    const { _id,name,email} = user;
    return res.json({
        token,
        user:{ _id,name,email}
    })
}
    } )
};
