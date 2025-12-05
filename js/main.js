import '@material/web/all.js';
import { setupNavbar } from './navigation.js';

const repo = "/Data-Visualization-project/";
const base = location.pathname.startsWith(repo) ? repo : "/";

// -------- Components --------
function includeComponent(id, file, callback) {
  fetch(base + file)
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
  });

  includeComponent("footer", "components/footer.html");
});

// -------- Torn images --------
document.querySelectorAll('.column img').forEach(img => {
  // Randomize mask slightly for torn effect
  const xShift = Math.random() * 20 - 10; // -10% to +10%
  const yShift = Math.random() * 20 - 10; // -10% to +10%
  img.style.webkitMaskPosition = `${50 + xShift}% ${50 + yShift}%`;
  img.style.maskPosition = `${50 + xShift}% ${50 + yShift}%`;

  // Optional: subtle random rotation for more realism
  const rotate = Math.random() * 4 - 2; // -2deg to +2deg
  img.style.transform = `rotate(${rotate}deg)`;
});