/**it switching the request to the corresponding controller */
const express = require("express");
const { requireSignin } = require("../Controller/auth");
const {getPost,createPost, postByuser, postById, deletePost, isPoster, updatePost,postPhoto,
    getSinglePost,like,unlike,comment,uncomment,postsForTimeline} = require("../Controller/posts")
const {createPostValidator} = require('../Validator/validation')
const { userById}  = require("../Controller/userProfile");
const router = express.Router();
router.get('/posts',getPost);
router.get('/posts/followers',requireSignin,postsForTimeline);
router.put('/post/like',requireSignin,like)
router.put('/post/unlike',requireSignin,unlike)
//comment and uncomment
router.put('/post/comment',requireSignin,comment)
router.put('/post/uncomment',requireSignin,uncomment)
router.get('/post/:userId/allposts',requireSignin,postByuser,createPostValidator);
router.post('/post/:userId/new',requireSignin,createPost,createPostValidator);
router.put('/post/:userId/:postId/update',requireSignin,isPoster,updatePost);
router.delete('/post/:userId/:postId/delete',requireSignin,isPoster,deletePost);
router.get("/post/:postId",getSinglePost);
router.get("/post/photo/:postId",postPhoto);
router.param("userId",userById);
router.param("postId",postById);
module.exports = router;
