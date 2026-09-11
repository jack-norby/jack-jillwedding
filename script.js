// Countdown to the ceremony. Runs only on pages that have a #countdown element.
document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('countdown');
  if (!el) return;

  // EDIT ME: your exact ceremony date and time.
  var weddingDate = new Date('2027-05-22T13:00:00');

  function unit(n, word) {
    return '<span>' + n + ' ' + word + (n === 1 ? '' : 's') + '</span>';
  }

  function tick() {
    var diff = weddingDate - new Date();

    if (diff <= 0) {
      el.innerHTML = '<span>We’re married!</span>';
      clearInterval(timer);
      return;
    }

    el.innerHTML =
      unit(Math.floor(diff / 86400000), 'day') +
      unit(Math.floor(diff / 3600000) % 24, 'hour') +
      unit(Math.floor(diff / 60000) % 60, 'minute') +
      unit(Math.floor(diff / 1000) % 60, 'second');
  }

  tick();
  var timer = setInterval(tick, 1000);
});
