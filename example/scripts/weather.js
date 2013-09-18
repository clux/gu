var weather = ['cool', 'hot', 'rainy', 'sunny'];

module.exports = function (gu) {

  gu.handle(/^weather (\w*) (\w*)/, function (city, day, say) {
    var forecast = weather[Math.floor(Math.random()*weather.length)];
    say('weather for ' + city + ' on ' + day + ': ' + forecast);
  });

};
