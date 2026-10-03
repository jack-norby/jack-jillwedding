/* ---------------------------------------------------------------
   Live registry check-off.

   PASTE YOUR GOOGLE APPS SCRIPT URL BELOW. It ends in /exec.
   Setup steps are in registry-setup.txt.

   Until you paste it, the page still works as a plain list: the
   "I'm buying this" buttons are hidden and nothing breaks.
   --------------------------------------------------------------- */

var REGISTRY_API = 'https://script.google.com/macros/s/AKfycbyWycybuWzeJcI4qHDTA_q6ti5lpYczHswZC6DSnmbvrK0XEkorj_2Y4WVUS6ZFB5P-/exec';

document.addEventListener('DOMContentLoaded', function () {
  var page = document.querySelector('.gift-list');
  if (!page) return;

  var status = document.getElementById('registry-status');

  function setStatus(text) {
    if (status) status.innerHTML = text;
  }

  // No backend configured yet: hide the buttons, leave a clean list.
  if (!REGISTRY_API) {
    document.querySelectorAll('.claim').forEach(function (b) { b.remove(); });
    var howto = document.getElementById('registry-howto');
    if (howto) howto.remove();
    setStatus('');
    return;
  }

  function markClaimed(ids) {
    ids.forEach(function (id) {
      var el = document.querySelector('.gift[data-id="' + id + '"]');
      if (el) el.classList.add('claimed');
    });
  }

  function remaining() {
    var all = document.querySelectorAll('.gift').length;
    var taken = document.querySelectorAll('.gift.claimed').length;
    return all - taken;
  }

  // ---- Load what's already been claimed ----
  fetch(REGISTRY_API + '?action=list')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      markClaimed(data.claimed || []);
      setStatus(remaining() + ' of ' + document.querySelectorAll('.gift').length + ' gifts still available');
    })
    .catch(function () {
      setStatus('We couldn’t load which gifts are taken. Please text us before buying so nothing gets doubled up.');
    });

  // ---- Claim an item ----
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.claim');
    if (!btn) return;

    var item = btn.closest('.gift');
    var id = item.getAttribute('data-id');
    var name = item.querySelector('.name').textContent.trim();

    if (!window.confirm('Mark "' + name + '" as taken?\n\nThis tells other guests it’s covered, so please only do this if you’re buying it.')) return;

    btn.disabled = true;
    btn.textContent = 'Saving…';

    fetch(REGISTRY_API + '?action=claim&id=' + encodeURIComponent(id))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        markClaimed(data.claimed || [id]);
        item.classList.add('claimed');
        setStatus(remaining() + ' of ' + document.querySelectorAll('.gift').length + ' gifts still available');
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'I’m buying this';
        window.alert('Sorry, that didn’t save. Please text us instead and we’ll mark it off.');
      });
  });
});
