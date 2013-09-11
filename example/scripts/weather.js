var weather = ['cool', 'hot', 'rainy', 'sunny'];

module.exports = function (gu) {

  gu.on(/^weather (\w*) (\w*)/, function (city, day) {
    var forecast = weather[Math.floor(Math.random()*weather.length)];
    gu.say('weather for ' + city + ' on ' + day + ': ' + forecast);
  });

};
