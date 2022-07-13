const user = require("../models/user");
const formidable = require("formidable");
const fs = require("fs");
const _ = require('lodash');
exports.userById = (req,res,next,id)=>{
    user.findById(id)
    .populate("following","_id name")
    .populate("followers","_id name")
    .exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"User not found"
            })
        }
        req.profile = user;//add profile object in req with user info
        next();
    })
}
// has authorization method for checking if user is valid or not
exports.hasAuthorization = (req,res,next)=>{
    let isSameUser = req.profile && req.auth && req.profile._id == req.auth._id;
    let isAdminUser = req.profile && req.auth && req.auth.role == 'admin';
    const authorize = isSameUser || isAdminUser;
    console.log(authorize)
    if(!authorize){
        return res.status(403).json({
            error:`User can't perform this operation`
        })
    }
    next();

}
//This module show all user to user
exports.allUser = (req,res)=>{
    user.find((err,user)=>{

        if(err){
            res.status(400).json({
                error:err
            })
        }
        res.json({user});
    }).select("name email created updated");
};
// show single user by using userID
exports.getUser = (req,res)=>{
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}
// update user
exports.updateUser = (req,res)=>{
    let form = new formidable.IncomingForm();
    //console.log(form)
    form.keepExtensions = true;
    form.parse(req,(err,fields,files) =>{
        if(err){
            return res.status(400).json({
                error:"Photo could not be uploaded"
            })
        }
        let user = req.profile;
        user = _.extend(user,fields);//it check the data of user and req,body. if it found it update on user.it will muted the source object.
        user.updated = Date.now();
        //console.log(files)
        if(files.photo){
            user.photo.data = fs.readFileSync(files.photo.filepath);
            //console.log(files.photo.orginalFilename)
            user.photo.contentType = files.photo.mimetype;
            //console.log(user.photo.contentType)
        }
        user.save((err)=>{
            if(err){
                return res.status(400).json({
                    error:err
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            res.json({user});
           });
    })
   
}
exports.userPhoto = (req,res,next) =>{
    if(req.profile.photo.data){
        //console.log(req.profile.photo.contentType);
        res.set("Content-Type",req.profile.photo.contentType);
        return res.send(req.profile.photo.data);
        next();
    }
}
exports.deleteUser = (req,res)=>{
    let user = req.profile;
    user.remove((err,user)=>{
        if(err){
            json.status(400).json({
                error:err
            });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json({message:"profile deleted sucessfully"});
        });
}
// Follow and Unfollow
exports.addFollowing = (req,res,next) =>{
    //console.log(JSON.stringify(req.body))
    user.findByIdAndUpdate(
        req.body.userId,
        {$push:{following:req.body.followId}},
        (err,result)=>{
            if(err){
            return res.status(400).json({error:err})
        }
        next();
    }
    
        );
}
exports.addFollower = (req,res) =>{
    user.findByIdAndUpdate(
        req.body.followId,
        {$push:{followers:req.body.userId}},
        {new:true})
        .populate('following','_id name')
        .populate('followers','_id name')
        .exec((err,result)=>{
            if(err){
                return res.status(400).json({
                    error:err
                })
            }
            else{
            result.hashed_password = undefined;
            user.salt = undefined;
            res.json(result);
            }
        })

}
//remove Follow and Unfollow
exports.removeFollowing = (req,res,next) =>{
    user.findByIdAndUpdate(
        req.body.userId,
        {$pull:{following:req.body.unfollowId}},
        (err,result)=>{
            if(err){
            return res.status(400).json({error:err})
        }
        next();
    }
    
        );
}
exports.removeFollower = (req,res,next) =>{
    user.findByIdAndUpdate(
        req.body.unfollowId,
        {$pull:{followers:req.body.userId}},
        {new:true})
        .populate('following','_id name')
        .populate('followers','_id name')
        .exec((err,result)=>{
            if(err){
                return res.status(400).json({
                    error:err
                })
            }
            result.hashed_password = undefined;
            user.salt = undefined;
        res.json(result);
        })
}
 exports.findpeople = (req,res) =>{
     let following = req.profile.following;
     following.push(req.profile._id);
     user.find({_id: {$nin:following} },
         (err,users) =>{
             if(err)
             {
                 return res.status(400).json({
                     error:err
                 })
             }
             res.json(users)
         }).select("name")

 }
