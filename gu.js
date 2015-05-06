var smell = require('smell');
var path = require('path');
var Duplex = require('stream').Duplex;

function Gu(scriptPath, files, opts, injected) {
  if (!(this instanceof Gu)) {
    return new Gu(scriptPath, files, opts, injected);
  }
  scriptPath = path.resolve(scriptPath);
  Duplex.call(this, {objectMode: true});

  this.injected = injected || {};
  opts = opts || {};

  this.files = [];
  for (var i = 0; i < (files || []).length; i += 1) {
    var f = path.join(scriptPath, files[i]);
    this.files.push(f);
  }
  this.log = smell();
  this.verbose = !!opts.verbose;
  this.handlers = [];
  this.load();
}
Gu.prototype = Object.create(Duplex.prototype);

// helpers for chokidar watchers
Gu.prototype.unload = function () {
  // stop handlers from being intercepted
  this.handlers = [];

  // force reload of all files next time
  for (var i = 0; i < this.files.length; i += 1) {
    var f = this.files[i];
    if (require.cache[f]) {
      this.log.info('Unloaded handlers from', f);
    }
    delete require.cache[f];
  }
};
Gu.prototype.load = function () {
  // require all files on the passed in scripts list to reattach handlers
  for (var i = 0; i < this.files.length; i += 1) {
    var f = this.files[i];
    var fn = require(f);
    fn(this, this.injected);
    this.log.info('Loaded handlers from', f);
  }
};

// write objects with: {user, message} keys
Gu.prototype._write = function (obj, encoding, cb) {
  var msg = obj.message;
  var user = obj.user;
  var chan = obj.channel;

  for (var i = 0; i < this.handlers.length; i += 1) {
    var handler = this.handlers[i];
    if (handler.reg.test(msg)) {
      if (this.verbose) {
        this.log.info(user + ':', msg, '- matched:', handler.reg);
      }
      var match = msg.match(handler.reg);
      var preparedSay = this.say.bind(this, user, chan);
      var args = [preparedSay].concat(match.slice(1), user);

      handler.cb.apply(this, args);
      break; // match found - job's done
    }
  }
  cb();
};

// needs to be here for some reason
Gu.prototype._read = function () {};

/**
 * say
 * Say msg in the channel the matching handler last fired
 */
Gu.prototype.say = function (user, chan, msg) { // TODO: include name?
  if (chan) {
    this.push({ user: user, channel: chan, message: msg });
  }
  else {
    this.push({ user: user, message: msg });
  }
};

/**
 * on
 * Attach handler functions to regular expressions
 * handler will fire with all the capture arguments from the regular expression
 * Regular expression will be applied to a white space trimmed version of
 * messages addressed to the bots name (via chanReg).
 */
Gu.prototype.handle = function (reg, handler) {
  this.handlers.push({reg: reg, cb: handler});
};

module.exports = Gu;
