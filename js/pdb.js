// Canine Companions — interaction layer

// Remove the no-js fallback class as early as possible so CSS knows a
// script is running (see the `.no-js .reveal` safety rule in style.css).
document.documentElement.classList.remove('no-js');

// Run a feature in isolation so one broken piece (e.g. a selector that
// finds nothing on a trimmed-down copy of this page) can never stop the
// rest of the page — most importantly, can never leave .reveal sections
// stuck invisible.
function safe(label, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[Canine Companions] "${label}" failed:`, err);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Hero headline: split into words, stagger in ---------- */
  safe('hero headline animation', () => {
    document.querySelectorAll('[data-animate-words]').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.animationDelay = `${0.08 * i}s`;
        el.appendChild(span);
      });
    });
  });

  /* ---------- 2. Scroll progress bar ---------- */
  const progressBar = document.getElementById('progress-bar');
  const updateProgress = () => {
    safe('progress bar update', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = `${pct}%`;
    });
  };

  /* ---------- 3. Sliding nav indicator + active section tracking ---------- */
  safe('nav indicator', () => {
    const nav = document.getElementById('site-nav');
    const navUl = nav ? nav.querySelector('.nav-ul') : null;
    const indicator = document.getElementById('nav-indicator');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id], main aside[id]');

    const moveIndicator = (link) => {
      if (!indicator || !link || !nav) return;
      // The indicator is absolutely positioned inside #site-nav, so measure
      // against the nav (getBoundingClientRect already includes ul scroll).
      const linkRect = link.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      indicator.style.left = `${linkRect.left - navRect.left}px`;
      indicator.style.width = `${linkRect.width}px`;
    };

    const setActiveLink = (id) => {
      let target = null;
      navLinks.forEach((link) => {
        const isMatch = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', isMatch);
        if (isMatch) target = link;
      });
      if (target) moveIndicator(target);
    };

    if ('IntersectionObserver' in window && sections.length) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveLink(entry.target.id);
          });
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      sections.forEach((section) => sectionObserver.observe(section));
    }

    window.addEventListener('resize', () => {
      safe('nav indicator resize', () => {
        const active = document.querySelector('.nav-link.active');
        if (active) moveIndicator(active);
      });
    });

    // Position now, and again once web fonts / images have settled, because
    // link widths change when the fonts swap in.
    const syncIndicator = () => {
      safe('nav indicator sync', () => {
        const current = document.querySelector('.nav-link.active') || document.querySelector('.nav-link');
        if (current) moveIndicator(current);
      });
    };
    window.requestAnimationFrame(syncIndicator);
    window.addEventListener('load', syncIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncIndicator);
  });

  /* ---------- 4. Scroll-triggered reveals (with a hard fallback) ---------- */
  safe('scroll reveals', () => {
    const revealEls = document.querySelectorAll('.reveal');

    // Force every reveal element visible right away for anything already
    // in the viewport on load (e.g. arriving via a #hash link), then let
    // the observer handle anything further down the page.
    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('is-visible');
    });

    if ('IntersectionObserver' in window && revealEls.length) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  });

  /* ---------- 5. Breed showcase switcher ---------- */
  safe('breed showcase', () => {
    const tabs = document.querySelectorAll('.showcase-tab');
    const showcaseImg = document.getElementById('showcase-img');
    const showcaseHeading = document.getElementById('showcase-heading');
    const showcaseParagraph = document.getElementById('showcase-paragraph');
    const showcaseDetail = document.getElementById('showcase-detail');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        safe('breed showcase click', () => {
          if (tab.classList.contains('is-active')) return;

          tabs.forEach((t) => {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');

          if (showcaseImg) {
            showcaseImg.style.opacity = '0';
            window.setTimeout(() => {
              showcaseImg.src = tab.dataset.img;
              showcaseImg.alt = tab.dataset.alt;
              showcaseImg.style.opacity = '1';
            }, 150);
          }
          if (showcaseHeading) showcaseHeading.textContent = tab.dataset.heading;
          if (showcaseParagraph) showcaseParagraph.textContent = tab.dataset.paragraph;
          if (showcaseDetail) showcaseDetail.textContent = tab.dataset.detail;
        });
      });
    });
  });

  /* ---------- 6. Care checklist ---------- */
  safe('care checklist', () => {
    const checkButtons = document.querySelectorAll('.care-check');
    const guideProgress = document.getElementById('guide-progress');

    const updateGuideProgress = () => {
      const total = checkButtons.length;
      const done = document.querySelectorAll('.care-check.is-done').length;
      if (guideProgress) {
        guideProgress.textContent = done === total
          ? `All ${total} tasks checked — nice work.`
          : `${done} of ${total} checked`;
      }
    };

    checkButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        safe('care checklist click', () => {
          btn.classList.toggle('is-done');
          updateGuideProgress();
        });
      });
    });
    updateGuideProgress();
  });

  /* ---------- 7. Back to top ---------- */
  const backToTop = document.getElementById('back-to-top');
  safe('back to top', () => {
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });

  /* ---------- 8. Scroll listener (progress bar + back-to-top visibility) ---------- */
  window.addEventListener('scroll', () => {
    updateProgress();
    safe('back to top visibility', () => {
      if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 600);
    });
  });
  updateProgress();
});