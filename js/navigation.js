// -------- Navbar --------
export function setupNavbar() {
  setupThemeToggle();
  setupMenu();
}

// -------- Theme Toggle --------
function setupThemeToggle() {
  const toggleBtn = document.querySelector('.theme-toggle-btn');
  if (!toggleBtn)
    return;

  toggleBtn.addEventListener('click', () => {
    switchMode();
  });
}

// -------- Menu --------
function setupMenu() {
  const anchorEl = document.querySelector('#usage-anchor');
  const menuEl = document.querySelector('#usage-menu');
  if (!anchorEl || !menuEl)
    return;

  anchorEl.addEventListener('click', () => {
    menuEl.open = !menuEl.open;
  });

  document.querySelectorAll('.section').forEach(item => {
    item.addEventListener('click', () => {
      const href = item.dataset.href;
      if (href)
        window.location.href = href;
    });
  });
}

// -------- Top Menu --------
export function topMenu() {
  const headers = document.querySelectorAll(
    'h2[id], h3[id], h4[id]'
  );

  const menu = document.getElementById('topMenuLinks');
  const indicator = document.getElementById('topMenuIndicator');

  if (!headers.length || !menu || !indicator)
    return;

  headers.forEach(header => {
    const level = header.tagName.replace('H', '');

    const item = document.createElement('button');
    item.className = 'md-menu-item';
    item.dataset.level = level;
    item.dataset.target = header.id;
    item.setAttribute('aria-label', header.dataset.title);

    const icon = document.createElement('span');
    icon.className = 'md-icon material-symbols-outlined';
    icon.textContent = 'circle';

    const label = document.createElement('span');
    label.className = 'md-label';
    label.textContent = header.dataset.title;

    item.append(icon, label);

    item.addEventListener('click', () => {
      const offset = 96;
      const y =
        header.getBoundingClientRect().top +
        window.scrollY -
        offset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    });

    menu.appendChild(item);
  });

  /* -------- Intersection Observer -------- */
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;

        // Remove active from all
        menu.querySelectorAll('.md-menu-item').forEach(i => i.classList.remove('active'));

        // Add active to current
        const active = menu.querySelector(`.md-menu-item[data-target="${id}"]`);
        if (!active) return;
        active.classList.add('active');

        // Move indicator
        const rect = active.getBoundingClientRect();
        const parent = menu.getBoundingClientRect();
        indicator.style.width = `${rect.width}px`;
        indicator.style.transform = `translateX(${rect.left - parent.left}px)`;
      });
    },
    {
      rootMargin: '-50% 0px -50% 0px', // adjust the "activation zone" verticall
      threshold: 0
    }
  );

  headers.forEach(h => observer.observe(h));
}