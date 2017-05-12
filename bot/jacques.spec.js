var Discord = require('discord.js');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var logger = require('./../common/util/logger.js');
var jacques = require('./jacques');
var soundboard = require('./soundboard');
var streamer = require('./streamer');
var messenger = require('./messenger');

//https://blog.risingstack.com/node-hero-node-js-unit-testing-tutorial/
//http://sinonjs.org/releases/v1.17.7/mocks/

beforeEach(function() {
    this.sandbox = sinon.sandbox.create()
})

afterEach(function() {
    this.sandbox.restore()
})

describe('routeTextChannelMessage', function() {
    beforeEach(function() {
        this.message = sinon.mock(Discord.Message);
        this.message.channel = sinon.mock(Discord.TextChannel);
        this.message.member = sinon.mock(Discord.Member);
        this.message.member.voiceChannel = sinon.mock(Discord.VoiceChannel);
        this.sandbox.stub(messenger, "deleteMessage");
    })

    it('routes ! to play a random sound', function() {
        var soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
        this.message.content = "!";
        expect(soundboardStub).to.be.called;

        jacques.routeTextChannelMessage(this.message);
    });
})
