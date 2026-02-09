const header = document.querySelector('.site-header');
const nav = document.querySelector('.site-nav');
const toggle = document.querySelector('.menu-toggle');
const progressBar = document.querySelector('#progress-bar');
const yearNode = document.querySelector('#year');
const cursorGlow = document.querySelector('#cursor-glow');

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (!nav.contains(target) && target !== toggle) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const updateScrollState = () => {
  const scrollY = window.scrollY;
  if (header) {
    header.classList.toggle('scrolled', scrollY > 12);
  }

  if (progressBar) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const value = maxScroll > 0 ? Math.min((scrollY / maxScroll) * 100, 100) : 0;
    progressBar.style.width = `${value}%`;
  }
};

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState);
updateScrollState();

const revealItems = Array.from(document.querySelectorAll('.reveal'));
revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 60, 220)}ms`;
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const sectionNodes = Array.from(document.querySelectorAll('main section[id]'));
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const linkByHash = new Map(navLinks.map((link) => [link.getAttribute('href'), link]));

if ('IntersectionObserver' in window && sectionNodes.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (!id || !entry.isIntersecting) {
          return;
        }
        navLinks.forEach((link) => link.classList.remove('active'));
        const active = linkByHash.get(`#${id}`);
        if (active) {
          active.classList.add('active');
        }
      });
    },
    {
      rootMargin: '-35% 0px -50% 0px',
      threshold: 0.05,
    }
  );

  sectionNodes.forEach((section) => sectionObserver.observe(section));
}

const counterNodes = Array.from(document.querySelectorAll('[data-count]'));
const animateCounter = (node) => {
  const target = Number(node.getAttribute('data-count'));
  if (!Number.isFinite(target)) {
    return;
  }

  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = String(Math.floor(target * eased));

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      node.textContent = String(target);
    }
  };

  requestAnimationFrame(step);
};

if ('IntersectionObserver' in window && counterNodes.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.55 }
  );

  counterNodes.forEach((node) => counterObserver.observe(node));
} else {
  counterNodes.forEach((node) => {
    const target = Number(node.getAttribute('data-count'));
    node.textContent = Number.isFinite(target) ? String(target) : node.textContent;
  });
}

if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
  cursorGlow.classList.add('active');

  window.addEventListener('mousemove', (event) => {
    cursorGlow.style.top = `${event.clientY}px`;
    cursorGlow.style.left = `${event.clientX}px`;
  });
}
