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

  const splitTextForRollingHover = (element) => {
    if (element.querySelector(".portfolio-header-v3__nav-letter")) return;

    const text = element.textContent.trim();
    if (!text) return;

    element.setAttribute("aria-label", text);
    element.textContent = "";

    Array.from(text).forEach((letter, index) => {
      const span = document.createElement("span");
      span.className = "portfolio-header-v3__nav-letter";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--letter-index", index);

      const track = document.createElement("span");
      track.className = "portfolio-header-v3__nav-letter-track";

      const current = document.createElement("span");
      current.className = "portfolio-header-v3__nav-letter-face";
      current.textContent = letter === " " ? "\u00a0" : letter;

      const next = document.createElement("span");
      next.className = "portfolio-header-v3__nav-letter-face";
      next.textContent = letter === " " ? "\u00a0" : letter;

      track.append(current, next);
      span.appendChild(track);
      element.appendChild(span);
    });
  };

  const initHeaderRollingHover = () => {
    const supportsRollingHover =
      body.classList.contains("page--portfolio-home-v3") ||
      body.classList.contains("page--case-documents-v1") ||
      body.classList.contains("page--case-booking-v2");

    if (!supportsRollingHover) return;

    document
      .querySelectorAll(
        [
          ".portfolio-header-v3__cv",
          ".portfolio-header-v3__nav a",
          ".contacts-v3__links a",
          ".case-booking-v2__back span:not(.case-back-chevron)",
          ".case-booking-v2__next span:not(.case-next-chevron)",
          ".case-documents-v1__back span:not(.case-back-chevron)",
          ".case-documents-v1__next span:not(.case-next-chevron)"
        ].join(", ")
      )
      .forEach(splitTextForRollingHover);
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

    const blob = document.createElement("div");
    blob.className = "portfolio-ambient-blob";
    blob.setAttribute("aria-hidden", "true");
    body.prepend(blob);

    let currentX = window.innerWidth * 0.72;
    let currentY = window.innerHeight * 0.32;
    let targetX = currentX;
    let targetY = currentY;
    let visible = false;
    let frame = 0;
    blob.classList.add("is-coral");

    const drawBlob = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      const rotation = Math.sin(currentX * 0.006 + currentY * 0.004) * 12;

      blob.style.transform = `translate3d(${currentX - 180}px, ${currentY - 140}px, 0) rotate(${rotation}deg) scale(${visible ? 1 : 0.9})`;

      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        frame = window.requestAnimationFrame(drawBlob);
      } else {
        frame = 0;
      }
    };

    const requestBlobFrame = () => {
      if (!frame) frame = window.requestAnimationFrame(drawBlob);
    };

    const showBlob = (event) => {
      visible = true;
      targetX = event.clientX;
      targetY = event.clientY;
      blob.style.opacity = "1";
      requestBlobFrame();
    };

    const hideBlob = () => {
      visible = false;
      blob.style.opacity = "0";
      requestBlobFrame();
    };

    window.addEventListener("pointermove", showBlob, { passive: true });
    window.addEventListener("pointerleave", hideBlob, { passive: true });

    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) {
        blob.remove();
        window.cancelAnimationFrame(frame);
      }
    });

  };

  renderHomePage();
  initHeaderRollingHover();
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












