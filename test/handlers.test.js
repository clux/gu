var Gu = require(process.env.GU_COV ? '../gu-cov' : '../')
  , sulfur = require('sulfur')
  , join = require('path').join
  ;

exports.example = function (t) {
  t.expect(8);
  var scriptsPath = join(process.cwd(), 'example', 'scripts');
  var exBot = new Gu(scriptsPath, ['dice.js', 'weather.js'], {
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
