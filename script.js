(function () {
  const root = document.documentElement;
  const body = document.body;
  const content = window.PORTFOLIO_CONTENT;

  const getValueByPath = (source, path) => {
    return path.split(".").reduce((accumulator, part) => {
      if (accumulator == null) return undefined;
      return accumulator[part];
    }, source);
  };

  const setMetaContent = (selector, value) => {
    if (!value) return;
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute("content", value);
    }
  };

  const renderSimpleBindings = () => {
    document.querySelectorAll("[data-content]").forEach((element) => {
      const value = getValueByPath(content, element.getAttribute("data-content"));
      if (typeof value === "string") {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-content-html]").forEach((element) => {
      const value = getValueByPath(content, element.getAttribute("data-content-html"));
      if (typeof value === "string") {
        element.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-content-href]").forEach((element) => {
      const value = getValueByPath(content, element.getAttribute("data-content-href"));
      if (typeof value === "string") {
        element.setAttribute("href", value);
      }
    });

    document.querySelectorAll("[data-content-src]").forEach((element) => {
      const value = getValueByPath(content, element.getAttribute("data-content-src"));
      if (typeof value === "string") {
        element.setAttribute("src", value);
      }
    });

    document.querySelectorAll("[data-content-alt]").forEach((element) => {
      const value = getValueByPath(content, element.getAttribute("data-content-alt"));
      if (typeof value === "string") {
        element.setAttribute("alt", value);
      }
    });

    document.querySelectorAll("[data-content-width]").forEach((element) => {
      const value = getValueByPath(content, element.getAttribute("data-content-width"));
      if (value != null) {
        element.setAttribute("width", String(value));
      }
    });

    document.querySelectorAll("[data-content-height]").forEach((element) => {
      const value = getValueByPath(content, element.getAttribute("data-content-height"));
      if (value != null) {
        element.setAttribute("height", String(value));
      }
    });
  };

  const renderCollection = (templateId, targetSelector, items, renderer) => {
    const template = document.getElementById(templateId);
    const target = document.querySelector(targetSelector);
    if (!template || !target || !Array.isArray(items)) return;

    target.innerHTML = "";

    items.forEach((item) => {
      const fragment = template.content.cloneNode(true);
      renderer(fragment, item);
      target.appendChild(fragment);
    });
  };

  const renderHomePage = () => {
    if (!content || !body.classList.contains("page--portfolio-home")) return;

    document.title = content.site.pageTitle;
    setMetaContent('meta[name="description"]', content.site.pageDescription);
    setMetaContent('meta[property="og:title"]', content.site.ogTitle);
    setMetaContent('meta[property="og:description"]', content.site.ogDescription);
    setMetaContent('meta[property="og:url"]', content.site.siteUrl || window.location.href);

    renderSimpleBindings();

    renderCollection("portfolio-nav-item-template", "[data-content-nav]", content.navigation, (fragment, item) => {
      const link = fragment.querySelector("a");
      link.setAttribute("href", item.href);
      link.textContent = item.label;
    });

    renderCollection("portfolio-about-paragraph-template", "[data-content-about]", content.about.paragraphs, (fragment, paragraphText) => {
      fragment.querySelector("p").textContent = paragraphText;
    });

    renderCollection("portfolio-experience-item-template", "[data-content-experience]", content.experience.items, (fragment, item) => {
      const listItem = fragment.querySelector(".experience-v3__item");
      fragment.querySelector(".experience-v3__period").textContent = item.period;
      fragment.querySelector(".experience-v3__role").textContent = item.role;

      if (item.size && item.size !== "default") {
        listItem.classList.add(`experience-v3__item--${item.size}`);
      }
    });

    renderCollection("portfolio-work-card-template", "[data-content-works]", content.works.items, (fragment, item) => {
      const card = fragment.querySelector(".project-card-v3");
      const media = fragment.querySelector(".project-card-v3__media");
      const image = fragment.querySelector("img");

      card.classList.add(`project-card-v3--${item.cardSize}`);
      media.classList.add(`project-card-v3__media--${item.cardSize}`);
      card.setAttribute("href", item.href);
      card.setAttribute("aria-label", item.ariaLabel);
      image.setAttribute("src", item.imageSrc);
      image.setAttribute("alt", item.imageAlt);
      image.setAttribute("width", String(item.imageWidth));
      image.setAttribute("height", String(item.imageHeight));
      fragment.querySelector(".project-card-v3__title").textContent = item.title;
    });

    renderCollection("portfolio-contact-item-template", "[data-content-contacts]", content.contacts.items, (fragment, item) => {
      const link = fragment.querySelector("a");
      link.setAttribute("href", item.href);
      link.textContent = item.label;

      if (item.newTab) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer");
      }
    });
  };

  renderHomePage();

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
