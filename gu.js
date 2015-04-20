var smell = require('smell');
var path = require('path');
var chokidar = require('chokidar');
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

  this.reload(true);
  if (!opts.noReload) { // hard to test gu when reload watchers keeps process alive
    // TODO: can join on *.js in scriptPath to use chokidar globbing
    this.watcher = chokidar.watch(scriptPath).on('change', this.reload.bind(this));
  }
}
Gu.prototype = Object.create(Duplex.prototype);

// Private helpers for chokidar interface
Gu.prototype.uncache = function () {
  // stop handlers from being intercepted
  this.handlers = [];

  // force reload of all files next time
  this.files.forEach(function (f) {
    delete require.cache[f];
  });
};
Gu.prototype.reload = function (origin) {
  this.log.info('Reloading script files after', origin, 'changed')
  this.uncache();

  // require all files on the passed in scripts list to reattach handlers
  for (var i = 0; i < this.files.length; i += 1) {
    var f = this.files[i];
    // try catch to avoid reloaded-syntax errors to keep the bot online
    try {
      var fn = require(f);
      if (!fn || 'function' !== typeof fn) {
        throw new Error("module.exports from file " +
          f + " in scripts directory is not a function"
        );
      }
      fn(this, this.injected);
      this.log.info('Reloaded handlers from', f);
    }
    catch (e) {
      // some files failed to load - ignore these scripts
      this.log.error('FAILED TO LOAD', f);
      this.log.error(e.stack);
    }
  }
};
Gu.prototype.unwatch = function () {
  if (this.watcher) {
    this.watcher.close();
    delete this.watcher;
  }
}

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
