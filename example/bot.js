#!/usr/bin/env node
var scriptPath = require('path').join(__dirname, 'scripts');
var files = [
  'dice.js',
  'weather.js'
];
var gu = require('gu')(scriptPath, files);

var ircStream = require('irc-stream')("irc.quakenet.org", "testBotz", {
  userName: 'failBot',
  debug: false,
  channels: ["#blahcurve"]
});

ircStream.pipe(gu).pipe(ircStream);
