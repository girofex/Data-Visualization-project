import '@material/web/all.js';
import { setupNavbar, topMenu } from './navigation.js';
import { showMobilePopup } from './popup.js';

//Responsive
window.addEventListener("load", () => {
  if (window.innerWidth <= 938)
    document.body.classList.add("desktop-scale");
});

// -------- Components --------
function includeComponent(id, file, callback) {
  fetch(file)
    .then(response => {
      if (!response.ok)
        throw new Error(`Failed loading ${file}`);

      return response.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;

      if (callback)
        callback();
    })
    .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", () => {
  showMobilePopup();

  //Grain effect
  grained('#main-grain', {
    animate: false,
    patternWidth: 100,
    patternHeight: 100,
    grainOpacity: 0.05,
    grainDensity: 1,
    grainWidth: 1,
    grainHeight: 1
  });

  includeComponent("navbar", "components/navigation.html", () => {
    setupNavbar();
    topMenu();
  });

  includeComponent("footer", "components/footer.html");
  includeComponent("top", "components/top.html");

  //Typewriter animation
  const h1Elements = document.querySelectorAll("h1");

  h1Elements.forEach(h1 => {
    const title = h1.closest(".title");

    const clone = h1.cloneNode(true);
    clone.style.visibility = "hidden";
    clone.style.position = "absolute";
    clone.style.height = "auto";
    clone.style.whiteSpace = "pre-wrap";
    document.body.appendChild(clone);
    const finalHeight = clone.offsetHeight;
    document.body.removeChild(clone);
    title.style.height = finalHeight + 25 + "px";

    let html = h1.innerHTML.replace(/<br\s*\/?>/gi, "\n");
    const lines = html.split("\n").map(line => line.trim());
    const text = lines.join("\n");
    const chars = text.split("");

    h1.innerHTML = "";

    const cursor = document.createElement("span");
    cursor.style.borderRight = "2px solid var(--beige)";
    cursor.style.display = "inline";
    cursor.style.verticalAlign = "bottom";
    const h1Rect = h1.getBoundingClientRect();
    cursor.style.height = h1Rect.height + "px";
    h1.appendChild(cursor);

    let i = 0;
    let animationStarted = false;

    function type() {
      if (i < chars.length) {
        const char = chars[i];
        if (char === "\n")
          h1.insertBefore(document.createElement("br"), cursor);
        else {
          const span = document.createElement("span");
          span.textContent = char;
          h1.insertBefore(span, cursor);
        }

        i++;
        setTimeout(type, 150);
      } else
        blinkCursor();
    }

    function blinkCursor() {
      let visible = true;

      setInterval(() => {
        cursor.style.borderRightColor = visible ? "transparent" : "var(--beige)";
        visible = !visible;
      }, 500);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animationStarted) {
          animationStarted = true;
          type();
          observer.disconnect();
        }
      });
    }, { threshold: 0.8 });

    observer.observe(h1);
  });
});