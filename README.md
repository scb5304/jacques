<img width=40% src="https://github.com/scb5304/jacques/blob/develop/jacques-web/app/assets/img/jacques_whole.png"></p>

[![Build Status](https://travis-ci.org/scb5304/jacques.svg?branch=master)](https://travis-ci.org/scb5304/jacques)
[![Coverage Status](https://coveralls.io/repos/github/scb5304/jacques/badge.svg?branch=master)](https://coveralls.io/github/scb5304/jacques?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/1d686034c7c2431a8f8e60bd7bfc7628)](https://www.codacy.com/app/scb5304/jacques?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=scb5304/jacques&amp;utm_campaign=Badge_Grade) 
[![dependencies Status](https://david-dm.org/scb5304/jacques/status.svg)](https://david-dm.org/scb5304/jacques)
[![devDependencies Status](https://david-dm.org/scb5304/jacques/dev-status.svg)](https://david-dm.org/scb5304/jacques?type=dev)

# Jacques

A simple Discord soundboard bot that uses [DiscordJS](https://discord.js.org/#/) to play audio in Discord voice channels, both custom sound clips and audio from youtube videos. His companion website http://jacquesbot.io displays sounds by Discord guild, usage statistics, and accepts sound clip uploads. 

<sub>**Please note that Discord Guild names or sound names may contain language that is inappropriate. I do not monitor or police content posted to the site, nor the servers Jacques is invited to.**<sub>

## Overview

While only one repository, Jacques is composed of 3 independently run modules. An overview of each module is provided immediately below. Additional information on libraries used is further down. Note: a lot of this information is for my own benefit when I come back to this project months from now and forget why I did things.

### jacques-bot

<img src="https://i.imgur.com/5vCHtYt.png">

The actual bot which the user interacts with in Discord. Jacques listens for user messages in text channels. When a message starts with an exclamation point, he recognizes it as a potential command. For example...

* *!lol* will join the current user's voice channel and play the sound clip called "lol" on that Guild (if it exists). 
* *!* will play a random sound clip. 
* *!stream* <youtube_url> will play a youtube video.
* *!volume* will print Jacques' current volume on that guild. Optionally, a value can be provided to adjust the volume.

Functionality is explained more in-depth at Jacques' [help page](http://jacquesbot.io/#/help).

### jacques-api

Provides sounds, guilds, and usage data about jacques-bot through a RESTful API. Endpoints include:

* GET */sounds*
* GET/POST/DELETE */sounds/:guildId/:soundName*
* GET */guilds*
* GET */guilds/:guildId*
* GET */statistics*
* GET */users/:birdfeed* (authentication)

### jacques-web

An AngularJS, [material design](https://material.angularjs.org/latest/) website that leverages jacques-api to display guilds Jacques is on, sounds on those guilds, and [pretty pictures](http://www.chartjs.org/) regarding sound usage (how often, how recently, randomly, etc.). Users can also preview, upload, and download sound clips.

<img src="https://i.imgur.com/aoxgiLi.png"> 

<img src="https://i.imgur.com/P44YYvA.png"><img src="https://i.imgur.com/VN3Mi7N.png">

##### Sound uploads

Sounds can be uploaded after the user has been "authenticated." Jacques uses a rudimentary authentication where the user types a command, "!birdfeed" on their Discord server. This command enters a User entry (mapping a generated UUID to the discord user's ID) into the database. A direct message is sent to the user that contains this 10-digit UUID ("birdfeed"). The user copies this value, visits the website, and pastes it into the "birdfeeder" to complete authentication. This birdfeed is considered stale after 2 hours, at which point the user must request new birdfeed.

This process verifies that:
1) The user is a member of a Discord Guild that Jacques belongs to.
2) The user has at least the "Attach Files" discord permission, allowing server administrators to restrict sound upload access.
3) The user does not need to enter the Guild ID the submission is for, nor who is submitting it, as that is included in the User object stored server-side. They can therefore perform multiple file uploads in a row without needing to enter any information at all. Plus, I can track the origin of a sound upload with a pretty good guarantee of who is responsible.
4) The user cannot submit sounds for guilds they are not a member of.

The birdfeed is stored client-side and then included in POST and DELETE requests.

### jacques-common

Not an independently run process, but a unit-tested module that shares models, database logic, logging, utility methods etc. between modules where possible.

## App Dependencies

* [AngularJS](https://angularjs.org/) because learning this client-side framework was one of the key objectives of this project.
* [Angular Material](https://material.angularjs.org/latest/) is used in conjunction with AngularJS to use high quality components and meet Google's [Material Design](https://material.io/guidelines/) specifications.
* [angular-chart.js](https://github.com/jtblin/angular-chart.js/) to support chart.js (below) in an AngularJS manner.
* [angular-mocks](https://docs.angularjs.org/guide/unit-testing#angular-mocks) per the AngularJS documentation as a recommended dependency for unit tests, especially those involving network transactions.
* [angular-resource](https://docs.angularjs.org/api/ngResource/service/$resource) as the sole module used for communicating from jacques-web to jacques-api, which under the hood uses the [$http](https://docs.angularjs.org/api/ng/service/$http) service.
* [AngularUI Router](https://github.com/angular-ui/ui-router), for client-side routing. Really helpful for supplying each view with the required data in Resolve blocks and mapping URLs to views.
* [App Root Path](https://github.com/inxilpro/node-app-root-path) to more easily locate the root folder of the project. Primarily used to support [dotenv](https://www.npmjs.com/package/dotenv), easily reading the .env file in any file for environment variables.
* [Bluebird](http://bluebirdjs.com/docs/getting-started.html) to replace Mongoose promises, which are deprecated.
* [body-parser](https://github.com/expressjs/body-parser) to parse JSON from network requests to jacques-api.
* [chart.js](https://github.com/chartjs/Chart.js) to display sound usage data and look gorgeous in general.
* [coveralls](https://github.com/nickmerwin/node-coveralls) for taking unit test .lcov files and sending it to coveralls.io to view code coverage.
* [DiscordJS](https://github.com/hydrabolt/discord.js/) for interfacing with the Discord API to do anything at all involving Discord.
* [dotenv](https://github.com/motdotla/dotenv) for loading environment variables for a simple .env config file. Helpful for both externalizing sensitive tokens and allowing them to differ on my development environment and 'production' box.
* [Express](https://github.com/expressjs/express): the standard server framework for Node.js.
* [Express Rate Limit](https://github.com/nfriedly/express-rate-limit) to prevent one IP address from overwhelming the API.
* [Angular Material File Input](https://github.com/shuyu/angular-material-fileinput) for supporting file uploads in AngularJS in a material fashion, plus drag-and-drop, preview, and other cool stuff.
* [mkdirp](https://github.com/substack/node-mkdirp) to create multiple directories in parallel. I'm not even sure if I need this module, to be honest, but I can't find a good reason to remove it.
* [moment](https://github.com/moment/moment/) for dates/times and math involving dates/times.
* [mongoose](https://github.com/Automattic/mongoose) for communicating with MongoDB.
* [node-opus](https://github.com/Rantanen/node-opus) to fulfill a DiscordJS dependency for transmitting audio.
* [readdirp](https://github.com/thlorenz/readdirp) to read through every guild's sound directories in parallel.
* [uuid](https://github.com/kelektiv/node-uuid) to generate unique identifiers for users that authenticate themselves across their Discord guild and the website.
* [winston](https://github.com/winstonjs/winston) because logging.
* [ytdl-core](https://github.com/fent/node-ytdl-core) to stream Youtube videos' audio through DiscordJS.

## Dev Dependencies

* [chai](https://github.com/chaijs/chai) to make assertions in Mocha unit tests.
* [cors](https://github.com/expressjs/cors) to locally facilitate testing between the website and api.
* [grunt](https://github.com/gruntjs/grunt) for the one below this.
* [grunt-lcov-merge](https://github.com/jacob-meacham/grunt-lcov-merge) to combine the code coverage results of jacques-bot, jacques-api, jacques-web, and jacques-common into one .lcov file! This results in one coveralls score and page for the entirety of Jacques.
* [Jasmine](https://github.com/jasmine/jasmine) as the client's unit testing framework.
* [Karma](https://github.com/karma-runner/karma) as the client's test runner. Runs the code in actual browsers, or in my case, PhantomJS on the Travis build box.
* [karma-chrome-launcher](https://github.com/karma-runner/karma-chrome-launcher) to speed up local unit testing by running them in Chrome instead of PhantomJS.
* [karma-coverage](https://github.com/karma-runner/karma-coverage) to generate code coverage from karma-run client-side unit tests.
* [karma-jasmine](https://github.com/karma-runner/karma-jasmine) as glue to stick Karma and Jasmine together.
* [karma-phantomjs-launcher](https://github.com/karma-runner/karma-phantomjs-launcher) so that the client-side browser unit tests can be run without an actual web browser installed.
* [Mocha](https://github.com/mochajs/mocha) as the test runner for all server-side unit tests. I plug in Chai and Sinon to do asserts and mocks.
* [npm-run-all](https://github.com/mysticatea/npm-run-all) to run my unit test scripts for each module in parallel.
* [nyc](https://github.com/istanbuljs/nyc) to get an lcov code coverage file from each Jacques module's unit tests.
* [Sinon](https://github.com/sinonjs/sinon) as the stub/spy/mock portion of the Mocha test suite.

## Nuts and Bolts

Jacques runs on a [DigitalOcean droplet](https://www.digitalocean.com/products/droplets/). This was a great learning opportunity for me to better understand setting up an environment via the command line and learning linux commands in general. [PuTTY](http://www.putty.org/) was used to communicate with the droplet from my computer. I purposely chose not to deploy using a service like Heroku so that I'm intimately involved with the entire stack. Plus, it seems more flexible.

[PM2](http://pm2.keymetrics.io/) continually runs jacques-api, jacques-web, and jacques-bot.

Nginx is used as a reverse proxy as per [this guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04). Jacques' web and api modules both run on the jacquesbot.io server, but have different locations (the former being "/", and the latter being "/api".

Travis builds Jacques upon any commit to the /develop or /master branch. It installs Jacques' dependencies, runs all unit tests, and submits a code coverage report to [Coveralls](https://coveralls.io/github/scb5304/jacques) upon build completion. I manually deploy the master branch to the droplet upon all unit tests passing.

<img src="https://i.imgur.com/m80IJSn.png">

As mentioned above, Coveralls (the "coverage" badge at the top of this page) is used to monitor Jacques' unit test code coverage. [Codacy](https://www.codacy.com/app/scb5304/jacques/dashboard) is leveraged for static code analysis. [David](https://david-dm.org/scb5304/jacques) analyzes dependencies to look for new, outdated, or insecure libraries being used by Jacques. One of the funnest parts of developing Jacques has been seeing how easy it is to plug an open source project into these sorts of tools.

## Reflection

This project has been a learning opportunity more than anything else. I had no Javascript experience to speak of. My prior web experience was limited to [JavaServerFaces](http://www.oracle.com/technetwork/java/javaee/javaserverfaces-139869.html), HTML, CSS, and [Bootstrap](https://getbootstrap.com/). This was my first time building a Node.js application, an AngularJS application, a RESTful API, creating a MongoDB database, etc. I feel that I really accomplished my goal of getting out of my Java/Android comfort zone and making something very different.

Some lessons learned:

1. Architect the application at least a little bit prior to coding it. Simply steaming ahead with code resulted in numerous refactors.
2. Take notes of what you're doing, as you do it, so that future you is not miserably trying to figure out how it was done.
3. Unit test code as you write it, not when you've written most of the application.

## Miscellaneous

* I do not have any plans to modify this codebase beyond bug fixes, dependency management, and minor feature tweaks.
* I plan to maintain Jacques' website and bot for the forseeable future.
* Special thanks to Evan Walker for the idea of a Discord bot that plays sound clips. Without his suggestion I would have lost out on a really fun side project.
