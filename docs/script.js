    const countdown = document.getElementById('countdown');
    const message = document.getElementById('message');
    const otherPage = document.getElementById('otherPage');
    const toggleBtn = document.getElementById('toggleBtn');
    const startCountdown = new Date();


    
    let countdownEnded = false;

    function updateCountdown() {
      const now = new Date();
      const target = new Date(`2025-07-07T20:30:00`);
      const timeDiff = target - now;

      if (timeDiff <= 0 && !countdownEnded) {
        // End the countdown
        countdown.style.display = "none";
        message.style.display = "block";
        countdownEnded = true;
        console.log(now, target)
        if (startCountdown < target) {
          const sound = new Audio("https://github.com/hrtk000/sandpit/raw/refs/heads/bday/docs/hbd.m4a"); // Specify the .m4a file path
          sound.play(); // Play the sound
        }

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
  const start = new Date('2025-07-23T12:00:00');
  const end = new Date('2025-07-24T00:00:00');
  const totalDuration = end - start;

  const toggleBtn = document.getElementById('toggleBtn');

  if (now < start) {
    toggleBtn.style.opacity = 0.01;
    toggleBtn.style.pointerEvents = 'none';
  } else if (now >= end) {
    toggleBtn.style.opacity = 1;
    toggleBtn.style.pointerEvents = 'auto';
  } else {
    const progress = (now - start) / totalDuration + 0.01;
    toggleBtn.style.opacity = (progress > 1.0 ? 1.0 : progress).toFixed(4);
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

      const items = [
        ["encryptMessage1", "output1"],  // First pair of strings
        ["encryptMessage2", "output2"],  // Second pair of strings
      ];

      // Encrypt each message in the list
      for (const [messageID, outputID] of items) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const message = document.getElementById(messageID).value; // Correctly retrieve the value
        const encoded = new TextEncoder().encode(message); // Encode the message
        const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, await deriveKey(password), encoded);

        // Combine the static IV and cipherBuffer into one byte array
        const fullBuffer = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
        fullBuffer.set(iv, 0); // Set the IV at the beginning
        fullBuffer.set(new Uint8Array(cipherBuffer), iv.byteLength); // Set the encrypted content after IV

        // Convert the result to a base64-encoded string
        const base64 = btoa(String.fromCharCode(...fullBuffer));
        document.getElementById(outputID).innerHTML = base64;
      }
    }

async function decrypt() {
  const password = document.getElementById("decryptKey").value;
  
  const encryptedLink = "oml6dmtA46ClfLS0iVQb9+P8H1DLV4j9dVAa0Ld2C2ikJ6JH7W1KJkMEl/JY/0DSyxp+Th8FGjT9W74="
  const encryptedPasscode = "pt7NJzQAfcc7zXRICq/F0rOOS04MzzhKy3Kao+FhaT0P+QcpHHVCssgdsL9E0VjsN1Y="
  
  try {
    console.log(password)
    const decryptedLink = await decryptMessage(encryptedLink, password); // Decrypt the message
    const decryptedPasscode = await decryptMessage(encryptedPasscode, password); // Decrypt the message
    console.log(decryptedLink)
    document.getElementById("output").href = decryptedLink
    document.getElementById("output").innerHTML = decryptedLink
    document.getElementById("copyable").innerHTML = decryptedPasscode
    document.getElementById("copyableLabel").textContent = "Passcode: tap to copy!"
  } catch (err) {
    document.getElementById("output").innerHTML = "go again boss that wasn't right (don't tap me I don't work)";
    document.getElementById("output").href = "#";
    document.getElementById("copyable").textContent = "";
    document.getElementById("copyableLabel").textContent = "";
  }
}

// Helper function to handle the decryption logic
async function decryptMessage(base64, password) {
  const fullBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const iv = fullBuffer.slice(0, 12);  // The IV is the first 12 bytes
  const data = fullBuffer.slice(12);   // The encrypted data starts after the IV

  // Derive the key from the password
  const key = await deriveKey(password);
  
  // Decrypt the message using AES-GCM
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await deriveKey(password), data);
  console.log(decrypted)
  // Decode the decrypted data to a string
  const decoded = new TextDecoder().decode(decrypted);

  return decoded;
}

function copyToClipboard(el) {
  const text = el.textContent;

  // Create a temporary textarea to hold the text
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");  // Fallback for older browsers
  document.body.removeChild(textarea);

  // Optional: feedback
  alert("Copied to clipboard!");
}