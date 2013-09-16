# Gu [![Build Status](https://secure.travis-ci.org/clux/gu.png)](http://travis-ci.org/clux/gu)
Gu is a minimalistic bot makers wrapper for the [irc module](https://npmjs.org/package/irc).

It adds two key features to the [irc module](https://npmjs.org/package/irc) module:

- regular expression handlers in the style of [hubot](https://github.com/github/hubot) (but without all those annoying environment variables and coffee-script..)
- hot code reloading of specified files (without the bot having to leave the server)

## Usage
Create a main file, `bot.js` say:

```javascript
var gu = require('gu')(server, "botName", ircOpts, scriptPath, files);
```

The first three arguments to `Gu` are simply passed through to the [irc module](https://npmjs.org/package/irc). The fourth and fifth is the script path, and the files in the scriptpath that will be watched for changes (and is assumed to contain handlers exported behind a function).


Then, put a file in your scriptpath, `like.js`, say, and add handlers therein:

```javascript
module.exports = function (gu) {
  gu.on(/^i like your (\w*)$/, function (what) {
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
Since `gu` handlers are essentially transportless response functions, if your handler packages does not include the `gu` dependency, you can essentially release the behaviour, and let people include it using the gu transport they want. XMPP should be a easy to implement as a drop in replacement for gu (TODO).

## Caveats
The script path you specify to `gu` should only contain the handler functions. If you point the path at your `lib` dir, then it may reload all the files in that directory when you change one of your handlers.


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
