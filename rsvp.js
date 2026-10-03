/* ---------------------------------------------------------------
   RSVP lookup.

   Uses the SAME Google Apps Script URL as the registry. If you ever
   redeploy and the URL changes, update it here and in registry.js.
   --------------------------------------------------------------- */

var RSVP_API = 'https://script.google.com/macros/s/AKfycbyWycybuWzeJcI4qHDTA_q6ti5lpYczHswZC6DSnmbvrK0XEkorj_2Y4WVUS6ZFB5P-/exec';

document.addEventListener('DOMContentLoaded', function () {
  var findForm = document.getElementById('rsvp-find');
  if (!findForm) return;

  var nameInput  = document.getElementById('rsvp-name');
  var findMsg    = document.getElementById('rsvp-find-msg');
  var chooseStep = document.getElementById('rsvp-choose');
  var choicesBox = document.getElementById('rsvp-choices');
  var rsvpForm   = document.getElementById('rsvp-form');
  var householdEl= document.getElementById('rsvp-household');
  var peopleBox  = document.getElementById('rsvp-people');
  var emailInput = document.getElementById('rsvp-email');
  var noteInput  = document.getElementById('rsvp-note');
  var formMsg    = document.getElementById('rsvp-form-msg');
  var doneStep   = document.getElementById('rsvp-done');
  var doneMsg    = document.getElementById('rsvp-done-msg');

  var current = null;

  function show(step) {
    [findForm, chooseStep, rsvpForm, doneStep].forEach(function (el) {
      el.hidden = (el !== step);
    });
  }

  function restart() {
    current = null;
    findMsg.textContent = '';
    formMsg.textContent = '';
    nameInput.value = '';
    show(findForm);
    nameInput.focus();
  }

  document.querySelectorAll('[data-restart]').forEach(function (b) {
    b.addEventListener('click', restart);
  });

  // ---- Step 1: look up the household ----
  findForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = nameInput.value.trim();
    if (q.length < 2) {
      findMsg.textContent = 'Please type a little more of your name.';
      return;
    }

    findMsg.textContent = 'Looking…';

    fetch(RSVP_API + '?action=lookup&name=' + encodeURIComponent(q))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var matches = (data && data.matches) || [];

        if (!matches.length) {
          findMsg.textContent = 'We couldn’t find that name. Try the last name exactly as it appears on your invitation, or text us and we’ll help.';
          return;
        }
        if (matches.length === 1) {
          openHousehold(matches[0]);
          return;
        }

        choicesBox.innerHTML = '';
        matches.forEach(function (m) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'btn-choice';
          b.textContent = m.household;
          b.addEventListener('click', function () { openHousehold(m); });
          choicesBox.appendChild(b);
        });
        findMsg.textContent = '';
        show(chooseStep);
      })
      .catch(function () {
        findMsg.textContent = 'Something went wrong on our end. Please text us and we’ll add your RSVP.';
      });
  });

  // ---- Step 2: show that household's people ----
  function openHousehold(match) {
    current = match;
    householdEl.textContent = 'Welcome, ' + match.household + '. Please let us know who can make it.';

    peopleBox.innerHTML = '';
    match.members.forEach(function (name, i) {
      var row = document.createElement('div');
      row.className = 'person';
      row.innerHTML =
        '<span class="person-name"></span>' +
        '<span class="person-choice">' +
          '<label><input type="radio" name="p' + i + '" value="yes" required> Joyfully accepts</label>' +
          '<label><input type="radio" name="p' + i + '" value="no"> Regretfully declines</label>' +
        '</span>';
      row.querySelector('.person-name').textContent = name;
      row.setAttribute('data-name', name);
      peopleBox.appendChild(row);
    });

    formMsg.textContent = '';
    show(rsvpForm);
  }

  // ---- Step 3: submit ----
  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!current) return;

    var people = [];
    var missing = false;
    peopleBox.querySelectorAll('.person').forEach(function (row) {
      var picked = row.querySelector('input:checked');
      if (!picked) { missing = true; return; }
      people.push({ name: row.getAttribute('data-name'), attending: picked.value === 'yes' });
    });

    if (missing) {
      formMsg.textContent = 'Please choose for everyone in your party.';
      return;
    }

    var btn = rsvpForm.querySelector('.btn-primary');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    formMsg.textContent = '';

    var url = RSVP_API +
      '?action=rsvp' +
      '&household=' + encodeURIComponent(current.household) +
      '&people='    + encodeURIComponent(JSON.stringify(people)) +
      '&email='     + encodeURIComponent(emailInput.value.trim()) +
      '&note='      + encodeURIComponent(noteInput.value.trim());

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.ok) throw new Error('save failed');
        var going = people.filter(function (p) { return p.attending; }).length;
        doneMsg.textContent = going
          ? 'We have you down for ' + going + (going === 1 ? ' guest' : ' guests') + '. We can’t wait to celebrate with you.'
          : 'We’re sorry you can’t make it, but thank you for letting us know. You’ll be missed.';
        show(doneStep);
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Send our RSVP';
        formMsg.textContent = 'That didn’t save. Please try again, or text us and we’ll take care of it.';
      });
  });
});
