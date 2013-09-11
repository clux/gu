module.exports = function (gu) {

  gu.on(/^roll D(\d*)/i, function (n) {
    var die = n | 0;
    if (die > 0 && die <= 1000) {
      var roll = Math.floor(Math.random()*die) + 1;
      gu.say(roll);
    }
  });

};
