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

      if (item.cardSize) {
        card.classList.add(`project-card-v3--${item.cardSize}`);
        media.classList.add(`project-card-v3__media--${item.cardSize}`);
      }

      card.setAttribute("href", item.href);
      card.setAttribute("aria-label", item.ariaLabel);
      image.setAttribute("src", item.imageSrc);
      image.setAttribute("alt", item.imageAlt);
      image.setAttribute("width", String(item.imageWidth));
      image.setAttribute("height", String(item.imageHeight));
      fragment.querySelector(".project-card-v3__title").textContent = item.title;

      const description = fragment.querySelector(".project-card-v3__description");
      if (item.description) {
        description.textContent = item.description;
      } else {
        description.remove();
      }

      const cta = fragment.querySelector(".project-card-v3__cta");
      if (item.ctaLabel) {
        cta.textContent = item.ctaLabel;
      } else {
        cta.remove();
      }
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

  const initPortfolioDotField = () => {
    if (!body.classList.contains("page--portfolio-home-v3") && !body.classList.contains("page--case-documents-v1") && !body.classList.contains("page--case-booking-v2")) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "portfolio-dot-field";
    canvas.setAttribute("aria-hidden", "true");
    body.prepend(canvas);
    body.classList.add("has-dynamic-dots");

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const styles = getComputedStyle(body);
    const dotSize = Number.parseFloat(styles.getPropertyValue("--v3-dot-size")) || Number.parseFloat(styles.getPropertyValue("--case-documents-dot-size")) || Number.parseFloat(styles.getPropertyValue("--case-dot-size")) || 24;
    const baseColor = "rgba(46, 58, 88, 0.24)";
    const accentColor = styles.getPropertyValue("--v3-accent").trim() || styles.getPropertyValue("--case-documents-accent").trim() || styles.getPropertyValue("--case-accent").trim() || "#fe6d52";
    const maxRatio = 1.5;
    const influenceRadius = 150;
    const dots = [];
    const pointer = {
      x: -9999,
      y: -9999,
      currentX: -9999,
      currentY: -9999,
      previousX: -9999,
      previousY: -9999,
      energy: 0
    };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;

    const buildGrid = () => {
      dots.length = 0;
      const cols = Math.ceil(width / dotSize) + 2;
      const rows = Math.ceil(height / dotSize) + 2;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          dots.push({
            x: col * dotSize,
            y: row * dotSize
          });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      pointer.currentX += (pointer.x - pointer.currentX) * 0.16;
      pointer.currentY += (pointer.y - pointer.currentY) * 0.16;
      pointer.energy *= 0.9;

      dots.forEach((dot) => {
        const dx = dot.x - pointer.currentX;
        const dy = dot.y - pointer.currentY;
        const distance = Math.hypot(dx, dy);
        const proximity = Math.max(0, 1 - distance / influenceRadius);
        const eased = proximity * proximity;
        const shift = eased * 7 * pointer.energy;
        const angle = Math.atan2(dy, dx);
        const x = dot.x + Math.cos(angle) * shift;
        const y = dot.y + Math.sin(angle) * shift;
        const radius = 1 + eased * maxRatio;

        context.beginPath();
        context.fillStyle = eased > 0.14 ? accentColor : baseColor;
        context.globalAlpha = 0.7 + eased * 0.3;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 1;

      if (pointer.energy > 0.015) {
        frame = window.requestAnimationFrame(draw);
      } else {
        frame = 0;
      }
    };

    const requestDraw = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const syncPointer = (event) => {
      pointer.previousX = pointer.x;
      pointer.previousY = pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const distance = Math.hypot(pointer.x - pointer.previousX, pointer.y - pointer.previousY);
      pointer.energy = Math.min(1, pointer.energy + distance / 90 + 0.18);
      requestDraw();
    };

    const hidePointer = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      pointer.energy = 0.7;
      requestDraw();
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", syncPointer, { passive: true });
    window.addEventListener("pointerleave", hidePointer, { passive: true });

    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) {
        canvas.remove();
        body.classList.remove("has-dynamic-dots");
        window.cancelAnimationFrame(frame);
      }
    });
  };

  renderHomePage();
  initPortfolioDotField();

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
      toggle.setAttribute("aria-label", isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему");
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

  const initCaseLightbox = () => {
    if (
      !body.classList.contains("page--case-booking-v2") &&
      !body.classList.contains("page--case-documents-v1")
    ) {
      return;
    }

    const imageSelector = [
      ".case-booking-v2__hero-media img",
      ".case-booking-v2__screen-media img",
      ".case-documents-v1__hero-media img",
      ".case-documents-v1__screen-media img"
    ].join(", ");

    const images = Array.from(document.querySelectorAll(imageSelector));
    if (!images.length) return;

    const overlay = document.createElement("div");
    overlay.className = "case-lightbox";
    overlay.setAttribute("hidden", "");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="case-lightbox__backdrop" data-lightbox-close></div>
      <div class="case-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Просмотр изображения">
        <button class="case-lightbox__close" type="button" aria-label="Закрыть просмотр" data-lightbox-close>&times;</button>
        <button class="case-lightbox__nav case-lightbox__nav--prev" type="button" aria-label="Предыдущее изображение" data-lightbox-prev>
          <span aria-hidden="true">&#8249;</span>
        </button>
        <figure class="case-lightbox__figure">
          <img class="case-lightbox__image" src="" alt="">
        </figure>
        <button class="case-lightbox__nav case-lightbox__nav--next" type="button" aria-label="Следующее изображение" data-lightbox-next>
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    const overlayImage = overlay.querySelector(".case-lightbox__image");
    const closeButtons = overlay.querySelectorAll("[data-lightbox-close]");
    const prevButton = overlay.querySelector("[data-lightbox-prev]");
    const nextButton = overlay.querySelector("[data-lightbox-next]");
    let activeIndex = 0;

    const syncImage = () => {
      const current = images[activeIndex];
      if (!current) return;
      overlayImage.setAttribute("src", current.getAttribute("src") || "");
      overlayImage.setAttribute("alt", current.getAttribute("alt") || "");
    };

    const openLightbox = (index) => {
      activeIndex = index;
      syncImage();
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
      body.classList.add("is-lightbox-open");
    };

    const closeLightbox = () => {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
      body.classList.remove("is-lightbox-open");
    };

    const stepLightbox = (direction) => {
      activeIndex = (activeIndex + direction + images.length) % images.length;
      syncImage();
    };

    images.forEach((image, index) => {
      image.classList.add("case-lightbox__trigger");
      image.setAttribute("tabindex", "0");
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", "Открыть изображение на весь экран");

      image.addEventListener("click", () => openLightbox(index));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeLightbox);
    });

    prevButton.addEventListener("click", () => stepLightbox(-1));
    nextButton.addEventListener("click", () => stepLightbox(1));

    document.addEventListener("keydown", (event) => {
      if (overlay.hidden) return;

      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        stepLightbox(-1);
      } else if (event.key === "ArrowRight") {
        stepLightbox(1);
      }
    });
  };

  initCaseLightbox();
})();












