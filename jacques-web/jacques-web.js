require("dotenv").config({path: "./../.env"});

const express = require("express");
const path = require("path");
const appRoot = require("app-root-path");

const app = express();
const port = 8080;

const soundsPath = appRoot + "/sounds";
const webPath = appRoot + "/jacques-web";
const nodeModulesPath = appRoot + "/node_modules/..";

app.use("/raw", express.static(soundsPath));
app.use(express.static(webPath));
app.use(express.static(nodeModulesPath));

app.use(function(req, res) {
    res.sendFile(path.join(webPath, "/index.html"));
});

app.listen(port);
