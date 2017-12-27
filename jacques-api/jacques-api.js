require("dotenv").config({path: "./../.env"});

const express = require("express");
const bodyParser = require("body-parser");
const db = require("../common/data/db.js");
const logger = require("../common/util/logger.js");
const soundController = require("./sound-controller");
const userController = require("./user-controller");
const guildController = require("./guild-controller");

var cors = require("cors");
const app = express();
const router = express.Router();
const port = 8081;

app.use(cors());
app.use(bodyParser({limit: '700kb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '700KB'
}));
app.use(bodyParser.json());

db.connect();

router.route("/sounds")
    .get(soundController.getSounds);

router.route("/sounds/:guild")
    .get(soundController.getSoundsByGuild);

router.route("/sounds/:guild/:soundName")
    .get(soundController.getSoundByGuildAndName)
    .post(soundController.postSound);

router.route("/users/:birdfeed")
    .get(userController.getUser);

router.route("/guilds")
    .get(guildController.getGuilds);

router.route("/guilds/:guild")
    .get(guildController.getGuild);

app.use("/api", router);
app.listen(port);