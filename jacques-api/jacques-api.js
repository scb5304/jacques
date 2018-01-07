require("dotenv").config({path: "./../.env"});

const express = require("express");
const bodyParser = require("body-parser");
const db = require("../common/data/db.js");
const logger = require("../common/util/logger.js");
const soundController = require("./sound-controller");
const userController = require("./user-controller");
const guildController = require("./guild-controller");
const statisticsController = require("./statistics-controller");

const app = express();
const router = express.Router();
const port = 8081;

app.use(bodyParser.json({
    limit: '700KB'
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '700KB'
}));

db.connect().then(function() {
    logger.info("Jacques API connected to database.");
});

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