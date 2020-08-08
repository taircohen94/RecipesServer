// Letting all origins to pass
const cors = require("cors");

const corsConfig = {
    origin: true,
    credentials: true
};

//#region express configures
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("client-sessions");
const DButils = require("./modules/DButils");

// routes importing 
const auth = require("./routes/auth");
const users = require("./routes/users");
const recipes = require("./routes/recipes");

// app setting and conffig
const app = express();
const port = process.env.PORT || "4000";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan(":method :url :status  :response-time ms"));
///app.use(cors);
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

app.use(
    session({
        cookieName: "session", // the cookie key name
        secret: process.env.COOKIE_SECRET, // the encryption key
        duration: 20 * 60 * 1000, // expired after 20 sec
        activeDuration: 0, // if expiresIn < activeDuration,
        //the session will be extended by activeDuration milliseconds
        cookie: {
            httpOnly: false
        }

    })
);

//#endregion

//#region cookie middleware
app.use(function(req, res, next) {
    if (req.session && req.session.user_id) {
        DButils.execQuery("SELECT user_id FROM users")
            .then((users) => {
                if (users.find((x) => x.user_id === req.session.user_id)) {
                    req.user_id = req.session.user_id;
                }
                next();
            })
            .catch((error) => next());
    } else {
        next();
    }
});
//#endregion

app.use("/users", users);
app.use("/recipes", recipes);
app.use(auth);

//defualt !! 
app.use((req, res) => {
    res.sendStatus(404);
});

app.use(function(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).send({ message: err.message, success: false });
});

const server = app.listen(port, () => {
    console.log(`Server listen on port ${port}`);
});

process.on("SIGINT", function() {
    if (server) {
        server.close(() => console.log("server closed"));
    }
    process.exit();
});