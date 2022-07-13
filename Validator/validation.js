/**vaildiate the data from request */
exports.createPostValidator = (req,res,next)=>{
    //checking title from request
 req.check("title","Please enter valid title").notEmpty();
    
 req.check("title","Title must be between 4 to 150 character").isLength({
    min:4,
    max:150
 });
 // checking body from request
 req.check("body","Please enter valid body content").notEmpty();
 req.check("body","body must be between 4 to 400 character").isLength({
    min:4,
    max:400
 });
 //checking error
 const errors = req.validationErrors();
 if(errors)
 {
 
     const firstError = errors.map((error)=>error.msg)
     return res.status(400).json({
         error:firstError
     })

 }
 
 next();
};
 exports.createSignupValidator = (req,res,next)=>{
     //checking user name
    req.check("name","User name is required").notEmpty();
    //checking email 
    req.check("email","Email is required").notEmpty();
    req.check("email")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @ ")
    .isLength({
        min: 3,
        max:30
    })
    .withMessage("Email must be between 3 to 30 character")   
    //checking password
    req.check('password',"Password is required").notEmpty();
    req.check('password')
    .matches(/\d/)
    .withMessage("Password must contain atleast one number")
    .isLength(
        {min:6}
    )
    .withMessage("Password contain atleast 6 character")
    //checking errors
    const errors = req.validationErrors();
 if(errors)
 {
 
     const firstError = errors.map((error)=>error.msg)[0]
     return res.status(400).json({
         error:firstError
     })

 }
 
 next();
 };
 exports.passwordResetValidator = (req, res, next) => {
    // check for password
    req.check('newPassword', 'Password is required').notEmpty();
    req.check('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 chars long')
        .matches(/\d/)
        .withMessage("Password must contain atleast one number")

    // check for errors
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    // proceed to next middleware or ...
    next();
};