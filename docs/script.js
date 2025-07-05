    const countdown = document.getElementById('countdown');
    const message = document.getElementById('message');
    const otherPage = document.getElementById('otherPage');
    const toggleBtn = document.getElementById('toggleBtn');

    let countdownEnded = false;

    function updateCountdown() {
      const now = new Date();
      const target = new Date(`2025-07-23T00:00:00`);
      const timeDiff = target - now;

      if (timeDiff <= 0 && !countdownEnded) {
        // End the countdown
        countdown.style.display = "none";
        message.style.display = "block";
        countdownEnded = true;
        return;
      }

      if (!countdownEnded) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);
        countdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Toggle between main (countdown or message) and other page
    toggleBtn.addEventListener('click', () => {
      const mainVisible = otherPage.style.opacity !== '1';

      if (mainVisible) {
        otherPage.style.opacity = '1';
        otherPage.style.pointerEvents = 'auto';

        if (!countdownEnded) {
          countdown.style.opacity = '0';
          countdown.style.pointerEvents = 'none';
        }
        message.style.opacity = '0';
        message.style.pointerEvents = 'none';
      } else {
        otherPage.style.opacity = '0';
        otherPage.style.pointerEvents = 'none';

        if (!countdownEnded) {
          countdown.style.opacity = '1';
          countdown.style.pointerEvents = 'auto';
        }
        if (countdownEnded) {
          message.style.opacity = '1';
          message.style.pointerEvents = 'auto';
        }
      }
    });

function graduallyFadeInButton() {
  const now = new Date();
  const start = new Date('2025-07-05T12:00:00');
  const end = new Date('2025-07-06T00:00:00');
  const totalDuration = end - start;

  const toggleBtn = document.getElementById('toggleBtn');

  if (now < start) {
    toggleBtn.style.opacity = 0;
    toggleBtn.style.pointerEvents = 'none';
  } else if (now >= end) {
    toggleBtn.style.opacity = 1;
    toggleBtn.style.pointerEvents = 'auto';
  } else {
    const progress = (now - start) / totalDuration;
    toggleBtn.style.opacity = progress.toFixed(4);
    toggleBtn.style.pointerEvents = progress > 0.1 ? 'auto' : 'none';
  }
}

graduallyFadeInButton();
setInterval(graduallyFadeInButton, 60000); // update every minute

    async function getKeyMaterial(password) {
      const encoder = new TextEncoder();
      return crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
    }

    async function deriveKey(password) {
      const keyMaterial = await getKeyMaterial(password);
      return crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: new TextEncoder().encode("staticSalt123"), // static salt for demo
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    }

    async function encrypt() {
      const password = document.getElementById("encryptKey").value;
      const message = document.getElementById("encryptMessage").value;

      const key = await deriveKey(password);
      const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector
      const encoded = new TextEncoder().encode(message);
      const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

      const fullBuffer = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
      fullBuffer.set(iv, 0);
      fullBuffer.set(new Uint8Array(cipherBuffer), iv.byteLength);

      const base64 = btoa(String.fromCharCode(...fullBuffer));
      document.getElementById("output").textContent = "Encrypted: " + base64;
    }

    async function decrypt() {
      const password = document.getElementById("decryptKey").value;
      const base64 = document.getElementById("decryptMessage").value;

      const fullBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const iv = fullBuffer.slice(0, 12);
      const data = fullBuffer.slice(12);

      try {
        const key = await deriveKey(password);
        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
        const decoded = new TextDecoder().decode(decrypted);
        document.getElementById("output").textContent = "Decrypted: " + decoded;
      } catch (err) {
        document.getElementById("output").textContent = "❌ Decryption failed: " + err.message;
      }
    }