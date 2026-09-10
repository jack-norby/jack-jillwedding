// ---- Mobile nav toggle ----
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.site-nav ul');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  // ---- Countdown (only runs if a #countdown block exists on the page) ----
  var countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    // EDIT ME: set your exact ceremony date/time here
    var weddingDate = new Date('2027-05-22T14:00:00');

    var daysEl = document.getElementById('cd-days');
    var hoursEl = document.getElementById('cd-hours');
    var minsEl = document.getElementById('cd-mins');
    var secsEl = document.getElementById('cd-secs');

    function tick() {
      var now = new Date();
      var diff = weddingDate - now;

      if (diff <= 0) {
        countdownEl.innerHTML = '<p class="place">We\u2019re married! \uD83D\uDC97</p>';
        clearInterval(timer);
        return;
      }

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var mins = Math.floor((diff / (1000 * 60)) % 60);
      var secs = Math.floor((diff / 1000) % 60);

      daysEl.textContent = days;
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(mins).padStart(2, '0');
      secsEl.textContent = String(secs).padStart(2, '0');
    }

    tick();
    var timer = setInterval(tick, 1000);
  }
});
