var irc = require('irc');
var path = require('path');
var hotReload = require('hot-reload');

// Gu class
// NB: extra listeners can be added to this.bot externally if you know what's what
function Gu(server, name, opts, scriptPath, files) {
  if (!(this instanceof Gu)) {
    return new Gu(server, name, opts, scriptPath, files);
  }
  this.bot = new irc.Client(server, name, opts);

  var chanReg = new RegExp('^' + name + '[\\s,\\:](.*)');
  this.bot.addListener('message', (function (from, to, msg) {
    // TODO: if privmessage pass straight to _write without chanReg
    if (!chanReg.test(msg)) {
      return; // message not for me
    }
    var content = msg.match(chanReg)[1].trim();
    if (!content) {
      return; // empty statement
    }
    this._write(content, to, from);
  }).bind(this));

  this.bot.addListener('error', function () {}); // never care about errors

  this._watchdir = scriptPath;
  this._files = files || [];
  var reloader = hotReload.create(require);
  files.forEach(function (f) {
    reloader.watch(path.join(scriptPath, f));
  });
  reloader
    .afterReload(this._reload.bind(this))
    .start();
  this._reload();
}

Gu.prototype._reload = function () {
  this._handlers = [];
  // require all files on the passed in scripts list to reattach handlers
  for (var i = 0; i < this._files.length; i += 1) {
    var f = this._files[i];
    try {
      var fn = require(path.join(this._watchdir, f));
      if (!fn || 'function' !== typeof fn) {
        throw new Error("module.exports from file " + f + " in scripts directory is not a function");
      }
      fn(this);
    }
    catch (e) {
      console.error('FAILED TO LOAD', f);
      console.log(e.stack);
    }
  }
};

Gu.prototype._write = function (content, chan, from) {
  for (var i = 0; i < this._handlers.length; i += 1) {
    var handler = this._handlers[i];
    if (handler.reg.test(content)) {
      var match = content.match(handler.reg);
      this.current = chan; // callback will .say to where it came from
      handler.cb.apply(this, match.slice(1).concat(from)); // `from` sometimes needed
      break; // match found - job's done
    }
  }
};

// public API
/**
 * say
 * Say msg in the channel the matching handler last fired
 */
Gu.prototype.say = function (msg) {
  this.bot.say(this.current, msg);
};

/**
 * on
 * Attach handler functions to regular expressions
 * handler will fire with all the capture arguments from the regular expression
 * Regular expression will be applied to a white space trimmed version of
 * messages addressed to the bots name (via chanReg).
 */
Gu.prototype.on = function (reg, handler) {
  this._handlers.push({reg: reg, cb: handler});
};
// public property: `bot` - for `irc` module passthroughs

module.exports = Gu;
