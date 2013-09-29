# gu [![Build Status](https://secure.travis-ci.org/clux/gu.png)](http://travis-ci.org/clux/gu) [![Dependency Status](https://david-dm.org/clux/gu.png)](https://david-dm.org/clux/gu)

Gu is a streaming bot makers library that you can pipe your transports to and from.

It has three main features:

- regular expression handlers in a style similar to [hubot](https://github.com/github/hubot) (but without all those annoying environment variables and coffee-script..)
- hot code reloading of specified files (without the bot having to leave the server)
- streaming input and output allows for easy control, extensibility and transport-less testing

## Usage
Find a library that does the transport you want, say [irc-stream](https://npmjs.org/package/irc-stream):

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
  gu.handle(/^i like your (\w*)$/, function (say, what) {
    say('i has ' + what + ' :O');
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
- [curvefever-bot](http://github.com/clux/curvefever-bot)

## Stream Specification
A `gu` instance expects to have objects written to it, and will new objects readable on the other end.

Therefore, the sensible interface (unless you are doing some weird asymmetrical connection setup), is a `Duplex` stream in [`objectMode`](http://nodejs.org/api/stream.html#stream_object_mode).

### Inputs & Outputs
Expected input objects:

```js
{
  user: String, // unique identifier of user
  message: String, // raw message to be matched by gu
}
```

Output objects are identical. The `user` property is passed stright through and is can be anything as long as it can be used to again identify the user to send the response to on the other end. For `irc-stream` it is either the string: "#chan:user" for a channel message or "user" for a personal message.

An optional `name` property may be set on the input for the convenience of gu handlers - this name will be passed through to the handlers as the last argument and is assumed to be human readable.

## Future
Alternative transport modules.

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
