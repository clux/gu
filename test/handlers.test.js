var Gu = require(process.env.GU_COV ? '../gu-cov' : '../')
  , sulfur = require('sulfur')
  , fs = require('fs')
  , join = require('path').join
  ;

exports.example = function (t) {
  t.expect(8);
  var scriptsPath = join(process.cwd(), 'example', 'scripts');
  var exBot = new Gu(scriptsPath, ['dice.js', 'weather.js'], {
    noReload: true,
    verbose: true
  });
  sulfur.absorb(exBot.log, 'gu');

  var ys = [];
  exBot.on('data', function (y) {
    ys.push(y);
  });

  exBot.write({user: 'clux', channel: "#test", message: "roll d8"});
  exBot.write({user: 'aa', message: 'weather oslo tuesday'});

  setTimeout(function () {
    t.equal(ys.length, 2, "got two messages");
    if (ys.length === 2) {
      t.ok(ys[0].message | 0, "dice roll a positive integer");
      t.equal(ys[0].user, 'clux', 'user preserved');
      t.equal(ys[0].channel, '#test', 'channel preserved');
      t.ok((ys[0].message | 0) <= 8, "dice roll lte 8");
      t.equal(ys[1].user, 'aa', 'user preserved in msg 2');
      t.ok(!ys[1].channel, 'no channel in msg 2');
      t.equal(ys[1].message.slice(0, 28), 'weather for oslo on tuesday:', 'weather');
    }
    t.done();
  }, 10);
};

exports.reloadHandlers = function (t) {
  var h1 = 'gu.handle(/hi/, function (say) { say("a"); });';
  var h2 = 'gu.handle(/hi/, function (say) { say("b"); });';
  var makeScript = function (h) {
    return 'module.exports = function (gu) { ' + h + ' };';
  };
  var scriptsPath = join(__dirname, 'scripts');
  var tempFile = join(scriptsPath, 'temp.js');
  fs.writeFileSync(tempFile, makeScript(h1));
  var rBot = new Gu(scriptsPath, ['temp.js']);
  sulfur.absorb(rBot.log, 'gu');

  var ys = [];
  rBot.on('data', function (y) {
    ys.push(y);
  });
  rBot.write({user: 'clux', message: 'hi'});

  setTimeout(function () {
    t.equal(ys[0].message, "a", "first message uses first handler");
    fs.writeFileSync(tempFile, makeScript(h2));
    setTimeout(function () {
      rBot.write({user: 'clux', message: 'hi2'});
      setTimeout(function () {
        t.equal(ys[1].message, "b", "second message uses second handler");
        rBot.unwatch();
        t.done();
      }, 10);
    }, 10);
  }, 10);
};

exports.reloadError = function (t) {
  var h1 = 'gu.handle(/hi/, function (say) { say("a"); });';
  var h2 = 'var b = arst'; // reference error on load
  var makeScript = function (h) {
    return 'module.exports = function (gu) { ' + h + ' };';
  };
  var scriptsPath = join(__dirname, 'scripts');
  var tempFile = join(scriptsPath, 'temp2.js');
  fs.writeFileSync(tempFile, makeScript(h1));
  var rBot = new Gu(scriptsPath, ['temp2.js']);
  sulfur.absorb(rBot.log, 'gu');

  var ys = [];
  rBot.on('data', function (y) {
    ys.push(y);
  });
  rBot.write({user: 'clux', message: 'hi'});

  setTimeout(function () {
    t.equal(ys[0].message, "a", "first message uses first handler");
    fs.writeFileSync(tempFile, makeScript(h2));
    setTimeout(function () {
      rBot.write({user: 'clux', message: 'hi2'});
      setTimeout(function () {
        t.equal(ys.length, 1, "no second message since reload failed");
        rBot.unwatch();
        t.done();
      }, 10);
    }, 10);
  }, 10);
};

exports.reloadRuntimeError = function (t) {
  var h1 = 'gu.handle(/hi/, function (say) { say("a"); });';
  var h2 = 'gu.handle(/hi/, function (say) { var b = qwfp; });'; // runtime error
  var makeScript = function (h) {
    return 'module.exports = function (gu) { ' + h + ' };';
  };
  var scriptsPath = join(__dirname, 'scripts');
  var tempFile = join(scriptsPath, 'temp2.js');
  fs.writeFileSync(tempFile, makeScript(h1));
  var rBot = new Gu(scriptsPath, ['temp2.js']);
  sulfur.absorb(rBot.log, 'gu');

  var ys = [];
  rBot.on('data', function (y) {
    ys.push(y);
  });
  rBot.write({user: 'clux', message: 'hi'});

  setTimeout(function () {
    t.equal(ys[0].message, "a", "first message uses first handler");
    fs.writeFileSync(tempFile, makeScript(h2));
    setTimeout(function () {
      try {
        rBot.write({user: 'clux', message: 'hi2'});
      }
      catch (e) {
        rBot.log.info('saw error on rBot.write:', e)
        t.ok(/ReferenceError/.test(e), 'saw ReferenceError');
        rBot.unwatch();
        t.done();
      }
    }, 10);
  }, 10);
};
