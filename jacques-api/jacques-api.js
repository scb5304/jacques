require("dotenv").config({path: "./../.env"});

const express = require("express");
const bodyParser = require("body-parser");
const db = require("../common/data/db.js");
const logger = require("../common/util/logger.js");
const soundController = require("./sound-controller");
const userController = require("./user-controller");
const guildController = require("./guild-controller");

const app = express();
const router = express.Router();
const port = 8081;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

db.connect();

router.use(function(req, res, next) {
    if (req.method === "GET") {
        res.header("Access-Control-Allow-Origin", "*");
    }
    next();
});

router.route("/sounds")
    .get(soundController.getSounds)
    .post(soundController.postSound);

router.route("/sounds/:guild")
    .get(soundController.getSoundsByGuild);

router.route("/sounds/:guild/:name")
    .get(soundController.getSoundByGuildAndName);

router.route("/users/:birdfeed")
    .get(userController.getUser);

router.route("/guilds")
    .get(guildController.getGuilds);

app.use("/api", router);
app.listen(port);