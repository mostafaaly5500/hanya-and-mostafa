// script.js
// Handles smooth scrolling for navigation links and the countdown timer

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for nav links
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const section = document.querySelector(targetId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
      // On small screens, close the nav menu after clicking a link
      const nav = document.querySelector('.nav');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
      }
    });
  });

  // Countdown logic
  const countdownElement = document.getElementById('countdown');
  if (countdownElement) {
    const targetDateString = countdownElement.getAttribute('data-target-date');
    const targetDate = new Date(targetDateString);
    const units = {
      days: countdownElement.querySelector('[data-unit="days"]'),
      hours: countdownElement.querySelector('[data-unit="hours"]'),
      minutes: countdownElement.querySelector('[data-unit="minutes"]'),
      seconds: countdownElement.querySelector('[data-unit="seconds"]'),
    };

    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        // Event has passed – display zeros
        units.days.textContent = '0';
        units.hours.textContent = '0';
        units.minutes.textContent = '0';
        units.seconds.textContent = '0';
        return;
      }
      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      units.days.textContent = days;
      units.hours.textContent = hours.toString().padStart(2, '0');
      units.minutes.textContent = minutes.toString().padStart(2, '0');
      units.seconds.textContent = seconds.toString().padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Guest count display using CountAPI.
  const guestCounterEl = document.getElementById('guestCounter');
  if (guestCounterEl) {
    // Fetch current guest count and show badge
    fetch('https://api.countapi.xyz/get/hanya_mostafa_wedding/guestCount')
      .then((res) => res.json())
      .then((data) => {
        guestCounterEl.style.display = 'inline-block';
        guestCounterEl.textContent = `Confirmed Guests: ${data.value ?? 0}`;
      })
      .catch(() => {
        // If the counter hasn't been created yet or fails, hide the badge
        guestCounterEl.style.display = 'none';
      });
  }

  // Intercept RSVP form submission to update guest counter
  const rsvpForm = document.querySelector('#rsvp form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const guestsInput = rsvpForm.querySelector('input[name="guests"]');
      const guestAmount = parseInt(guestsInput && guestsInput.value, 10) || 1;
      // Prepare data for optional Google Sheet logging
      const data = {
        first_name: rsvpForm.querySelector('input[name="first_name"]')?.value || '',
        last_name: rsvpForm.querySelector('input[name="last_name"]')?.value || '',
        email: rsvpForm.querySelector('input[name="email"]')?.value || '',
        guests: guestAmount,
        song_request: rsvpForm.querySelector('textarea[name="message"]')?.value || '',
        submitted_at: new Date().toISOString(),
      };
      // Update CountAPI and then optionally send to Google Sheet and submit the FormSubmit
      fetch(`https://api.countapi.xyz/update/hanya_mostafa_wedding/guestCount?amount=${guestAmount}`)
        .then((res) => res.json())
        .then((countData) => {
          if (guestCounterEl) {
            guestCounterEl.style.display = 'inline-block';
            guestCounterEl.textContent = `Confirmed Guests: ${countData.value}`;
          }
        })
        .finally(() => {
          // If a sheet endpoint is provided, log RSVP details to the sheet
          if (typeof SHEET_ENDPOINT !== 'undefined' && SHEET_ENDPOINT) {
            fetch(SHEET_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            }).catch(() => {
              // ignore network errors
            });
          }
          // Submit the form normally (will send via FormSubmit)
          rsvpForm.submit();
        });
    });
  }

  // RSVP deadline enforcement
  if (rsvpForm) {
    const RSVP_DEADLINE = new Date('2025-09-10T23:59:59+02:00');
    const now = new Date();
    if (now > RSVP_DEADLINE) {
      rsvpForm.querySelectorAll('input, textarea, button').forEach((el) => {
        el.disabled = true;
      });
      const closedMsg = document.createElement('p');
      closedMsg.classList.add('note');
      closedMsg.textContent = 'RSVPs are now closed.';
      rsvpForm.parentElement.appendChild(closedMsg);
    }
  }

  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
});

// Optional: define Google Sheets endpoint for RSVP data logging. To enable logging,
// set SHEET_ENDPOINT to your deployed Apps Script web app URL.
const SHEET_ENDPOINT = "";