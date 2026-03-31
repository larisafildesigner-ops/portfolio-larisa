(function () {
  const root = document.documentElement;
  const body = document.body;

  if (window.location.hash.includes("figmacapture=")) {
    root.setAttribute("data-capture", "true");
  }

  const toggle = document.querySelector("[data-theme-toggle]");
  const savedTheme = localStorage.getItem("portfolio-theme");

  if (savedTheme === "dark") {
    root.setAttribute("data-theme", "dark");
  }

  if (toggle) {
    const syncLabel = () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему");
      toggle.textContent = isDark ? "☀" : "◐";
    };

    syncLabel();

    toggle.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

      if (nextTheme === "light") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "dark");
      }

      localStorage.setItem("portfolio-theme", nextTheme);
      syncLabel();
    });
  }

  const header = document.querySelector(".site-header");
  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

  const animateCountUps = () => {
    const items = document.querySelectorAll("[data-countup]");
    if (!items.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      items.forEach((item) => {
        const value = Number(item.getAttribute("data-countup-value") || "0");
        const prefix = item.getAttribute("data-countup-prefix") || "";
        const suffix = item.getAttribute("data-countup-suffix") || "";
        item.textContent = `${prefix}${value}${suffix}`;
      });
      return;
    }

    const duration = 2000;
    const baseDelay = 650;
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    items.forEach((item, index) => {
      const value = Number(item.getAttribute("data-countup-value") || "0");
      const prefix = item.getAttribute("data-countup-prefix") || "";
      const suffix = item.getAttribute("data-countup-suffix") || "";
      const startAt = performance.now() + baseDelay + (index * 160);

      const tick = (now) => {
        if (now < startAt) {
          window.requestAnimationFrame(tick);
          return;
        }

        const progress = Math.min((now - startAt) / duration, 1);
        const eased = easeOutExpo(progress);
        const current = Math.round(value * eased);

        item.textContent = `${prefix}${current}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        }
      };

      item.textContent = `${prefix}0${suffix}`;
      window.requestAnimationFrame(tick);
    });
  };

  if (
    body.classList.contains("page--portfolio-home") ||
    body.classList.contains("page--case-booking-v2") ||
    body.classList.contains("page--case-documents-v1")
  ) {
    window.requestAnimationFrame(() => {
      body.classList.add("is-ready");
      if (
        body.classList.contains("page--case-booking-v2") ||
        body.classList.contains("page--case-documents-v1")
      ) {
        animateCountUps();
      }
    });
  }

  const filterButtons = document.querySelectorAll("[data-filter]");
  const filterItems = document.querySelectorAll("[data-case-type]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));

      filterItems.forEach((card) => {
        const type = card.dataset.caseType || "";
        const visible = value === "all" || type.includes(value);
        card.hidden = !visible;
      });
    });
  });
})();
