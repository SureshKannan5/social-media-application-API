/**it switching the authentication request to the corresponding controller */
const express = require("express");
const {signup, signin, signout,forgotPassword,resetPassword,socialLogin} = require("../Controller/auth");
const { userById } = require("../Controller/userProfile");
const {createSignupValidator,passwordResetValidator} = require('../Validator/validation')
const router = express.Router();
router.post('/signup',createSignupValidator,signup)
router.post('/signin',signin)
//sign out
router.get('/signout',signout)
// forgot password and Reset password route
router.post('/social-login',socialLogin)
router.put('/forgot-password',forgotPassword)
router.put('/reset-password',passwordResetValidator,resetPassword)
//any incoming request containing userid execute userByID()
router.param("userId",userById)
module.exports = router;
