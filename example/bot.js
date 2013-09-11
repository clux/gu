var files = [
  'dice.js',
  'weather.js'
];
var scriptPath = require('path').join(__dirname, 'scripts');

var gu = require('gu')("irc.quakenet.org", "testBot123", {
  userName: 'failBot',
  debug: false,
  channels: ['#testChan']
}, scriptPath, files);
