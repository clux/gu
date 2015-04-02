var Gu = require(process.env.GU_COV ? '../gu-cov' : '../')
  , sulfur = require('sulfur')
  , fs = require('fs')
  , join = require('path').join
  ;

exports.example = function (t) {
  t.expect(4);
  var scriptsPath = join(process.cwd(), 'example', 'scripts');
  var exBot = new Gu(scriptsPath, ['dice.js', 'weather.js'], {
    noReload: true,
    verbose: true
  });
  sulfur.absorb(exBot.log, 'gu');

  var xs = [
    {user: '#chan:clux', name: 'clux', message: "roll d8"},
    {user: '#chan:aa', name: 'aa', message: 'weather oslo tuesday'}
  ];
  var ys = [];
  exBot.on('data', function (y) {
    ys.push(y);
  });
  xs.forEach(function (x) {
    exBot.write(x);
  });

  setTimeout(function () {
    t.equal(ys.length, 2, "got two messages");
    if (ys.length === 2) {
      t.ok(ys[0].message | 0, "dice roll a positive integer");
      t.ok((ys[0].message | 0) <= 8, "dice roll lte 8");
      t.equal(ys[1].message.slice(0, 28), 'weather for oslo on tuesday:', 'weather');
    }
    t.done();
  }, 10);
};

exports.hotReload = function (t) {
  var h1 = 'gu.handle(/hi/, function (say) { say("a"); });';
  var h2 = 'gu.handle(/hi/, function (say) { say("b"); });';
  var makeScript = function (h) {
    return 'module.exports = function (gu) { ' + h + ' };';
  };
  var scriptsPath = join(__dirname, 'scripts');
  var tempFile = join(scriptsPath, 'temp.js');
  fs.writeFileSync(tempFile, makeScript(h1));
  var rBot = new Gu(scriptsPath, ['temp.js']);

  var ys = [];
  rBot.on('data', function (y) {
    ys.push(y);
  });
  rBot.write({user: '#chan:clux', message: 'hi'});

  setTimeout(function () {
    t.equal(ys[0].message, "a", "first message uses first handler");
    fs.writeFileSync(tempFile, makeScript(h2));
    setTimeout(function () {
      rBot.write({user: '#chan:clux', message: 'hi2'});
      setTimeout(function () {
        t.equal(ys[1].message, "b", "second message uses second handler");
        fs.unwatchFile(tempFile);
        fs.unlinkSync(tempFile);
        t.done();
        setTimeout(function () {
          process.exit(0); // can't easily kill reload watchers unfortunately
        }, 10);
      }, 10);
    }, 10);
  }, 10);
};
