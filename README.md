# Gu [![Build Status](https://secure.travis-ci.org/clux/gu.png)](http://travis-ci.org/clux/gu)

Gu is a streaming bot makers library that you can pipe your transports to and from.

It has three main features:

- regular expression handlers in a style similar to [hubot](https://github.com/github/hubot) (but without all those annoying environment variables and coffee-script..)
- hot code reloading of specified files (without the bot having to leave the server)
- streaming input and output allows for easy control, extensibility and transport-less testing

## Usage
Find a library that does the transport you want, say [irc-streams](https://npmjs.org/package/irc-stream):

Create a main file; `bot.js`:

```javascript
var gu = require('gu')(scriptPath, files);
var ircStream = require('ircStream')(name, server, {chan: chan});

ircStream.pipe(gu).pipe(ircStream);
```

The script path and the files (relative to the scriptpath) will be watched for changes, and is assumed to contain handlers exported behind a function.


Then, put a file in your scriptpath, `like.js`, say, and add handlers therein:

```javascript
module.exports = function (gu) {
  gu.handle(/^i like your (\w*)$/, function (what) {
    gu.say('i has ' + what + ' :O');
  });
};
```

Then fire up the bot with `node bot.js`, navigate to the specified server and channel (in `ircOpts`),
and try saying `botName: i like your charisma` in the channel.

Changing the handler in `like.js` will result in different behaviour without having to restart `bot.js`.

A more extensive example is avaiable in the [example directory](https://github.com/clux/gu/blob/master/example/).

## Complete examples
The following personal bots are all built on `gu`:

- [cleverbot-irc](http://github.com/clux/cleverbot-irc)
- [wolfram-irc](http://github.com/clux/wolfram-irc)
- [curvefever-stats](http://github.com/clux/curvefever-stats)

## Future
Alternative transport duplex stream modules.

## Caveats
The script path you specify to `gu` should only contain the handler functions. If you point the path at your `lib` dir, then it may reload all the files in that directory when you change one of your handlers.

If you have multiple handler files in your `scriptdir`, then if one changes, all these files will be reloaded, and any internal state in them will be cleared. To get around this, persist important state elsewhere.

## Installation

```bash
$ npm install gu --save
```

## Running tests
Install development dependencies

```bash
$ npm install
```

Run the tests

```bash
$ npm test
```

## License
MIT-Licensed. See LICENSE file for details.
