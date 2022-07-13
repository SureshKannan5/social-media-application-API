/*it get request from the routes/post.js and interact with models get the data and give response to front end(main file)*/
const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
const _ = require('lodash');
exports.postById = (req,res,next,id)=>
{
    Post.findById(id)
    .populate("postedBy","_id name role")
    .populate("comments","text created")
    .populate("comments.postedBy","_id name role")
    .exec((err,post)=>{
        if(!post){
            res.status(400).json({
                error:`PostedByerror${post}`
            })
        }
        req.post = post;
        next();
        
    });
  
}
exports.getPost = async (req,res) =>{
    //get current page form query or default page 1
    const currentPage = req.query.page || 1;
    //return 3 post per page
    const perPage = 3;
    let totalItems;

 const posts = await Post.find()
 //coutDocument() gives total count page
 .countDocuments()
 .then(count =>{
     totalItems = count;
     return Post.find()
     .skip((currentPage-1)* perPage)
     .populate("postedBy","_id name")
     .populate("comments","text created")
     .populate("comments.postedBy","_id name")
     .select("_id title body created likes comments")//selecting particular field from database.
     .sort({ created: -1})
     .limit(perPage)
     .then((posts)=>{
     res.json({
         posts
     }
     )})
 .catch(err=>console.log(err));
     
 })
};
//Get Single Post
exports.getSinglePost = (req,res) =>{
 res.json(req.post)

}
// create  a new post and assgin it to respective user 
exports.createPost = (req,res) =>{
        let form = new formidable.IncomingForm();     //it assging incoming request forms
        form.keepExtensions = true;// it keep file extension
        form.parse(req,(err,fields,files)=>{
            if(err){
                return res.status(400).json({
                    error:err
                });
            }
            //post handling
            let post = new Post(fields);
            //console.log(post)
            req.profile.hashed_password = undefined;
            req.profile.salt = undefined;
            post.postedBy = req.profile;// This shows which post came from user
            // post image handling
            if(files.photo){
                //console.log(files)
                // console.log(files.photo.filepath)
                post.photo.data = fs.readFileSync(files.photo.filepath);
                post.photo.contentType=files.photo.mimetype;
            }
            post.save((err,result)=>{
                if(err){
                    res.status(400).json({error:err});
                }
                res.json(result);
            })
        })
};
exports.postByuser = (req,res)=>{
    Post.find({postedBy:req.profile._id})
    .select("_id title body created likes ")
    .sort("created")
    .exec((err,posts)=>{
        if(err){
            res.status(400).json({err:err});
        }
        res.json(posts)
    });
};
exports.isPoster = (req, res, next) => {
    //console.log("Requested Auth:",req.auth,"requested Post:",req.post)
    let isSameUser = req.auth && req.post && req.post.postedBy._id == req.auth._id;
    let auth = req.post.postedBy._id == req.auth._id;
    console.log("Auth:",auth)
    console.log("Posetr id:",req.post.postedBy._id,"Logged in user id:",req.auth._id)
    let isAdminUser = req.auth && req.post && req.auth.role == 'admin';
    let isPoster = isSameUser || isAdminUser;
    //console.log("same user:",isPoster)
    console.log("Admin user:",isPoster)
    if (!isPoster) {
        return res.status(403).json({
            error: 'User is not authorized'
        });
    }
    next();
};
// exports.updatePost = (req,res)=>{
//     let post = req.post;
//     post = _.extend(post,req.body);//it check the data of user and req,body. if it found it update on user.it will muted the source object.
//     post.updated = Date.now();
//     post.save((err)=>{
//         if(err){
//             return res.status(400).json({
//                 error:err
//             });
//         }
//         res.json(post);
//        });
// }
//update new menthod
exports.updatePost = (req,res)=>{
    let form = new formidable.IncomingForm();
    //console.log(form)
    form.keepExtensions = true;
    form.parse(req,(err,fields,files) =>{
        if(err){
            return res.status(400).json({
                error:"Photo could not be uploaded"
            })
        }
        let post = req.post;
        post = _.extend(post,fields);//it check the data of user and req,body. if it found it update on user.it will muted the source object.
        post.updated = Date.now();
        //console.log(files)
        if(files.photo){
            post.photo.data = fs.readFileSync(files.photo.filepath);
            //console.log(files.photo.orginalFilename)
            post.photo.contentType = files.photo.mimetype;
            //console.log(user.photo.contentType)
        }
        post.save((err)=>{
            if(err){
                return res.status(400).json({
                    error:err
                });
            }
            res.json({post});
           });
    })
   
}

//delete posts
exports.deletePost = (req,res)=>{
    let post = req.post
    post.remove((err,post)=>{
        if(err){
            res.status(400).json({
                error:`deleteerror:${err}`
            })
        }
        res.json({
            message:"post deleted sucessfully"
        })
    });
}

    // Getting photo
    exports.postPhoto = (req,res,next) =>{
            //console.log(req.profile.photo.contentType);
            res.set("Content-Type",req.post.photo.contentType);
            return res.send(req.post.photo.data);
            next()
        
    }
//Like and Unlike Posts 
exports.like = (req,res)=>{
    //console.log(req)
Post.findByIdAndUpdate(req.body.postId,
    {$push:{likes:req.body.userId}},
    {new:true}
    ).exec((err,result)=>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        else{
            //console.log(result)
            return res.json(result)
        }

    })
}
exports.unlike = (req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,
        {$pull:{likes:req.body.userId}},
        {new:true}
        ).exec((err,result)=>{
            if(err){
                return res.status(400).json({
                    error:err
                })
            }
            else{
                return res.json(result)
            }
    
        })
    }
    exports.comment = (req,res)=>{
        //console.log(req)
        let comment = req.body.comment;
        comment.postedBy = req.body.userId;
        //console.log(comment)
        Post.findByIdAndUpdate(req.body.postId,
            {$push:{comments:comment}},
            {new:true}
            ).populate("comments.postedBy","_id name")
            .populate("postedBy","_id name")
            .exec((err,result)=>{
                console.log(result)
                if(err){
                    return res.status(400).json({
                        error:err
                    })
                }
                else{
                    //console.log(result)
                    return res.json(result)
                }
        
            })

    }
    exports.uncomment = (req, res) => {
        let comment = req.body.comment;
        Post.findByIdAndUpdate(req.body.postId, { $pull: { comments: { _id: comment._id } } }, { new: true })
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name')
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    });
                } else {
                    res.json(result);
                }
            });
    };
    exports.postsForTimeline = (req, res) => {
        let following = req.profile.following
        following.push(req.profile._id)
        Post.find({postedBy: { $in : req.profile.following } })
        .populate('comments', 'text created')
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .sort('-created')
        .exec((err, posts) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler.getErrorMessage(err)
            })
          }
          res.json(posts)
        })
      }