/**it switching the request to the corresponding userprofile controller */
const express = require("express");
const { requireSignin } = require("../Controller/auth");
const {  postById } = require("../Controller/posts");
const { userById, 
    allUser,
    getUser, 
    updateUser,
    deleteUser,
    userPhoto,
    addFollowing,
    addFollower,
    removeFollowing,
    removeFollower,
    findpeople,
    hasAuthorization
} = require("../Controller/userProfile");
const router = express.Router();
router.put('/user/follow',requireSignin,addFollowing,addFollower);
router.put('/user/unfollow',requireSignin,removeFollowing,removeFollower);
router.get('/user',allUser);
router.get('/user/:userId',requireSignin,getUser);
router.put('/user/:userId/update',requireSignin,hasAuthorization,updateUser);
//Getting Photo
router.get("/user/photo/:userId",userPhoto);
router.delete('/user/:userId/delete',requireSignin,hasAuthorization,deleteUser);
router.get('/user/findpeople/:userId',requireSignin,findpeople);
router.param("userId",userById);
router.param("postId",postById);
module.exports = router;
