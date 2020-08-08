var express = require("express");
var router = express.Router();
const { v1: uuidv1 } = require
    ("uuid");
const bcrypt = require("bcryptjs");
const DButils = require("../modules/DButils");


// Register - checks if the username already exits ,
// and if so - returns an error 
router.post("/Register", async(req, res, next) => {
    try {
        // parameters exists
        // valid parameters
        // username exists
        const users = await DButils.execQuery("SELECT username FROM users");
        if (users.find((x) => x.username === req.body.username))
            throw { status: 409, message: "Username taken" };
        // add the new username
        let hash_password = bcrypt.hashSync(
            req.body.password,
            parseInt(process.env.bcrypt_saltRounds)
        );
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let email = req.body.email;
        let image = req.body.image;
        let country = req.body.country;
        await DButils.execQuery(
            `INSERT INTO users VALUES (default,'${req.body.username}', '${hash_password}'
            , '${first_name}', '${last_name}', '${email}', '${image}', '${country}')`
        );
        res.status(201).send({ message: "user created", success: true });
    } catch (error) {
        next(error);
    }
});

// Login - required username and password 
router.post("/Login", async(req, res, next) => {
    try {
        // check that username exists
        const users = await DButils.execQuery("SELECT username FROM users");
        if (!users.find((x) => x.username === req.body.username))
            throw { status: 401, message: "Username or Password incorrect" };

        // check that the password is correct
        const user = (
            await DButils.execQuery(
                `SELECT * FROM users WHERE username = '${req.body.username}'`
            )
        )[0];

        if (!bcrypt.compareSync(req.body.password, user.password)) {
            throw { status: 401, message: "Username or Password incorrect" };
        }

        // Set cookie
        req.session.user_id = user.user_id;
        // req.session.save();
        // res.cookie(session_options.cookieName, user.user_id, cookies_options);

        // return cookie
        res.status(200).send({ message: "login succeeded", success: true });
    } catch (error) {
        next(error);
    }
});

// Logout
router.post("/Logout", function(req, res) {
    req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
    res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;