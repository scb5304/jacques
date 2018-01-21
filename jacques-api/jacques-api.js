require("dotenv").config({path: "./../.config/.env"});

const express = require("express");
const bodyParser = require("body-parser");
const Db = require("../jacques-common/data/db.js");
const logger = require("../jacques-common/util/logger.js");
const soundController = require("./sounds/sounds-controller");
const userController = require("./users/users-controller");
const guildController = require("./guilds/guilds-controller");
const statisticsController = require("./statistics/statistics-controller");

const app = express();
const router = express.Router();
const port = 8081;
const RateLimit = require("express-rate-limit");

//40 requests per minute before limited.
const limiter = new RateLimit({
    windowMs: 60 * 1000,
    max: 40,
    delayMs: 0
});

Db.connect().then(function() {
    logger.info("Jacques API connected to database.");
});

app.enable("trust proxy");
app.use(limiter);

app.use(bodyParser.json({
    limit: "700KB"
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: "700KB"
}));

router.route("/sounds")
    .get(soundController.getSounds);

router.route("/sounds/:guild")
    .get(soundController.getSoundsByGuild);

router.route("/sounds/:guild/:soundName")
    .get(soundController.getSoundByGuildAndName)
    .post(soundController.postSound)
    .delete(soundController.deleteSound);

router.route("/users/:birdfeed")
    .get(userController.getUser);

router.route("/guilds")
    .get(guildController.getGuilds);

router.route("/guilds/:guild")
    .get(guildController.getGuild);

router.route("/statistics")
    .get(statisticsController.getStatistics);

app.use("/api", router);
app.listen(port);