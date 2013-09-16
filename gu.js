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

  var writer = this._write.bind(this);
  // TODO: allow pm listens?
  //this.bot.addListener('pm', function (nick, msg) {
  //  writer(msg, null, nick);
  //});
  var chanReg = new RegExp('^' + name + '[\\s,\\:](.*)');
  this.bot.addListener('message', function (from, to, msg) {
    if (!chanReg.test(msg)) {
      return; // message not for me
    }
    var content = msg.match(chanReg)[1].trim();
    if (!content) {
      return; // empty statement
    }
    writer(content, to, from);
  });

  this.bot.addListener('error', function () {}); // never care about errors

  this._watchdir = scriptPath;
  this._files = (files || []).map(function (f) {
    return path.join(scriptPath, f);
  });
  this._reload();
  // TODO: hotReload will uncache everything in the scripts directory
  // thus clearing state kept in any of these, can this be remedied?
  hotReload.create(require)
    .watch(scriptPath)
    .uncache(scriptPath, true)
    .reload(scriptPath, true)
    .afterReload(this._reload.bind(this))
    .start();
}

Gu.prototype._reload = function () {
  this._handlers = [];
  // require all files on the passed in scripts list to reattach handlers
  for (var i = 0; i < this._files.length; i += 1) {
    var f = this._files[i];
    try {
      var fn = require(f);
      if (!fn || 'function' !== typeof fn) {
        throw new Error("module.exports from file " +
          f + " in scripts directory is not a function"
        );
      }
      fn(this);
      console.log('Loaded handlers from', f);
    }
    catch (e) {
      console.error('FAILED TO LOAD', f);
      console.error(e.stack);
    }
  }
};

Gu.prototype._write = function (content, chan, from) {
  for (var i = 0; i < this._handlers.length; i += 1) {
    var handler = this._handlers[i];
    if (handler.reg.test(content)) {
      var match = content.match(handler.reg);
      this.current = chan || from; // callback will .say to where it came from
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
