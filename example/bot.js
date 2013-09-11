var files = [
  'dice.js',
  'weather.js'
];
var scriptPath = require('path').join(__dirname, 'scripts');

var gu = require('gu')("irc.rd.tandberg.com", "h00t", {
  userName: 'arstast',
  debug: false,
  channels: ['#testor']
}, scriptPath, files);
