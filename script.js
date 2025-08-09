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
      const guestsInput = rsvpForm.querySelector('input[name="guests"]');
      const guestAmount = parseInt(guestsInput && guestsInput.value, 10) || 1;
      // Send update request to CountAPI and then submit the form
      fetch(`https://api.countapi.xyz/update/hanya_mostafa_wedding/guestCount?amount=${guestAmount}`)
        .then((res) => res.json())
        .then((data) => {
          if (guestCounterEl) {
            guestCounterEl.style.display = 'inline-block';
            guestCounterEl.textContent = `Confirmed Guests: ${data.value}`;
          }
          // After updating the counter, allow the form to submit normally
          rsvpForm.submit();
        })
        .catch(() => {
          // Even if update fails, still submit the form
          rsvpForm.submit();
        });
      // Prevent the default immediate submission to wait for the update call
      event.preventDefault();
    });
  }
});