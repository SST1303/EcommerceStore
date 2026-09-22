const express = require("express");


//it is used for logging in a user
const {
    registerUser,    // for registering a new user
    loginUser
} = require("../controllers/authController");


const router = express.Router();

router.post("/register", registerUser); // for register

router.post("/login", loginUser); // for login 

module.exports = router;