# gu
[![npm status](http://img.shields.io/npm/v/gu.svg)](https://www.npmjs.org/package/gu)
[![build status](https://secure.travis-ci.org/clux/gu.svg)](http://travis-ci.org/clux/gu)
[![dependency status](https://david-dm.org/clux/gu.svg)](https://david-dm.org/clux/gu)
[![coverage status](http://img.shields.io/coveralls/clux/gu.svg)](https://coveralls.io/r/clux/gu)

Gu is a streaming bot makers library that you can pipe your transports to and from.

It has two main features:

- regular expression handlers in a style similar to [hubot](https://github.com/github/hubot) (but without all those annoying environment variables and coffee-script..)
- streaming input and output allows for easy control, extensibility and transport-less testing of handlers

## Usage
Find a library that does the transport you want, say [irc-stream](https://npmjs.org/package/irc-stream):

Create a main file; `bot.js`:

```javascript
var gu = require('gu')(scriptPath, files);
var ircStream = require('ircStream')(name, server, {chan: [chan]});

ircStream.pipe(gu).pipe(ircStream);
```

The script path and the files (relative to the scriptpath) will be watched for changes, and is assumed to contain handlers exported behind a function.


Then, put a file in your scriptpath, `love.js`, say, and add handlers therein:

```javascript
module.exports = function (gu) {
  gu.handle(/^what is (\w*)$/, function (say, match) {
    if (match === 'love') {
      say("baby don't hurt me");
    }
  });
};
```

Then fire up the bot with `node bot.js`, navigate to the specified server and channel (in `ircOpts`),
and try saying `botName: what is love` in the channel.

Changing the handler in `love.js` will result in different behaviour without having to restart `bot.js`.

A more extensive example is avaiable in the [example directory](https://github.com/clux/gu/blob/master/example/).

## Complete examples
The following bots are built on `gu`:

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
  channel: String, // unique group chat identifier (if relevant)
  message: String, // raw message to be matched by gu
}
```

Output objects are identical. As an example an example message from/to `irc-stream` can look like this `{ user: 'clux', channel: '#quake', message: 'hi' }` for a private message, the `channel` key is unset.

An optional `name` property may be set for the convenience of the stream handler (such as `xmpp-stream`). It is used when doing group chat highlighting without having to necessarily use the larg UID. For IRC it is unused.

## Compatible Transports
Best tested: [irc-stream](https://github.com/clux/irc-stream).

Early prototype of [xmpp-stream](https://github.com/clux/xmpp-stream) also available.

## Options
A few options can be passed along to the `gu` instance as the third parameter, these are:

```js
{
  verbose: Boolean // enable regex match log when gu receives messages
}
```

### Logging
Emitted logs are available on the instance as `gu.log`. They are emitted in the form of [smell](https://github.com/clux/smell).

To actually print them out, you should use [sulfur](https://github.com/clux/sulfur) as such:

```js
var sulfur = require('sulfur');
sulfur.absorb(gu.log, 'gu');
```

You can also log from gu handlers by calling the log methods `error`, `warn`, or `info` on `gu.log`:

```js
gu.handle(/^(.*)$/, function (say, match) {
  gu.log.info("matched the everything handler with", match);
});
```

## Installation

```sh
$ npm install gu
```

## License
MIT-Licensed. See LICENSE file for details.
