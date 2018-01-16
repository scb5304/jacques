<img width=40% src="https://github.com/scb5304/jacques/blob/develop/jacques-web/app/assets/img/jacques_whole.png"></p>

[![Build Status](https://travis-ci.org/scb5304/jacques.svg?branch=master)](https://travis-ci.org/scb5304/jacques)
[![Coverage Status](https://coveralls.io/repos/github/scb5304/jacques/badge.svg?branch=master)](https://coveralls.io/github/scb5304/jacques?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/1d686034c7c2431a8f8e60bd7bfc7628)](https://www.codacy.com/app/scb5304/jacques?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=scb5304/jacques&amp;utm_campaign=Badge_Grade) 
[![dependencies Status](https://david-dm.org/scb5304/jacques/status.svg)](https://david-dm.org/scb5304/jacques)
[![devDependencies Status](https://david-dm.org/scb5304/jacques/dev-status.svg)](https://david-dm.org/scb5304/jacques?type=dev)

# Jacques

A simple Discord soundboard bot that uses [DiscordJS](https://discord.js.org/#/) to play audio in Discord voice channels, both custom sound clips and youtube video audio. His companion website http://jacquesbot.io displays sounds by Discord guild, usage statistics, and accepts sound clip uploads. 

## Overview

While only one repository, Jacques is composed of 3 independently run modules. An overview of each module is provided immediately below. Additional information on libraries used, unit testing, etc. is further down.

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

!<img src="https://i.imgur.com/P44YYvA.png">!<img src="https://i.imgur.com/VN3Mi7N.png">

## Libraries
TODO
## Unit Testing
TODO
## Moving Forward
TODO
