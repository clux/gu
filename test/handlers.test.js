var tap = require('tap')
  , test = tap.test
  , fs = require('fs')
  , Gu = require('../')
  , join = require('path').join;

test("example", function (t) {
  var exBot = new Gu(join('..','example', 'scripts'), ['dice.js', 'weather.js'], {
    noReload: true
  });
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
    t.ok(ys[0].message | 0, "dice roll a positive integer");
    t.ok((ys[0].message | 0) <= 8, "dice roll lte 8");
    t.equal(ys[1].message.slice(0, 28), 'weather for oslo on tuesday:', 'weather');
    t.end();
  }, 10);
});

test("hot reloading", function (t) {
  var h1 = 'gu.handle(/hi/, function (say) { say("a"); });';
  var h2 = 'gu.handle(/hi/, function (say) { say("b"); });';
  var makeScript = function (h) {
    return 'module.exports = function (gu) { ' + h + ' };';
  };
  fs.writeFileSync('./scripts/temp.js', makeScript(h1));
  var rBot = new Gu('./scripts', ['temp.js']);

  var ys = [];
  rBot.on('data', function (y) {
    ys.push(y);
  });
  rBot.write({user: '#chan:clux', message: 'hi'});

  setTimeout(function () {
    t.equal(ys[0].message, "a", "first message uses first handler");
    fs.writeFileSync('./scripts/temp.js', makeScript(h2));
    setTimeout(function () {
      rBot.write({user: '#chan:clux', message: 'hi2'});
      setTimeout(function () {
        t.equal(ys[1].message, "b", "second message uses second handler");
        fs.unwatchFile('./scripts/temp.js');
        fs.unlinkSync('./scripts/temp.js');
        t.end();
        setTimeout(function () {
          process.exit(0); // can't easily kill reload watchers unfortunately
        }, 10);
      }, 10);
    }, 10);
  }, 10);
});
