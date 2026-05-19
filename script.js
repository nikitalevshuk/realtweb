/**
 * Landing interactions: accordion, tabs, swipe carousel
 */

(function () {
  "use strict";

  initAccordion();
  initTabs();
  initCarousel();
})();

/* ---------- Accordion ---------- */

function initAccordion() {
  const root = document.querySelector("[data-accordion]");
  if (!root) return;

  const trigger = root.querySelector(".accordion__trigger");
  const panel = root.querySelector(".accordion__panel");
  if (!trigger || !panel) return;

  trigger.addEventListener("click", () => {
    const isOpen = root.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "");
    }
  });
}

/* ---------- Tabs ---------- */

function initTabs() {
  const root = document.querySelector("[data-tabs]");
  if (!root) return;

  const buttons = root.querySelectorAll(".tabs__btn");
  const panels = root.querySelectorAll(".tabs__panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      if (!target || btn.classList.contains("is-active")) return;

      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
        b.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        const match = panel.dataset.panel === target;
        panel.classList.toggle("is-active", match);
        if (match) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      });
    });
  });
}

/* ---------- Carousel ---------- */

function initCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  const track = document.querySelector("[data-carousel-track]");
  const dotsContainer = document.querySelector("[data-carousel-dots]");
  if (!carousel || !track || !dotsContainer) return;

  const slides = Array.from(track.querySelectorAll(".carousel__slide"));
  const count = slides.length;
  if (count === 0) return;

  let index = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let slideWidth = 0;
  let gap = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Кейс ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll(".carousel__dot"));

  function measure() {
    const style = getComputedStyle(track);
    gap = parseFloat(style.gap) || 0;
    slideWidth = slides[0].getBoundingClientRect().width;
  }

  function goTo(i, animate = true) {
    index = Math.max(0, Math.min(count - 1, i));
    measure();
    const offset = index * (slideWidth + gap);
    track.style.transition = animate ? "" : "none";
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    dots.forEach((dot, j) => dot.classList.toggle("is-active", j === index));
  }

  function onStart(clientX) {
    isDragging = true;
    startX = clientX;
    currentX = clientX;
    track.style.transition = "none";
  }

  function onMove(clientX) {
    if (!isDragging) return;
    currentX = clientX;
    const delta = currentX - startX;
    measure();
    const base = index * (slideWidth + gap);
    track.style.transform = `translate3d(-${base - delta}px, 0, 0)`;
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = "";

    const delta = currentX - startX;
    const threshold = slideWidth * 0.2;

    if (delta < -threshold && index < count - 1) {
      goTo(index + 1);
    } else if (delta > threshold && index > 0) {
      goTo(index - 1);
    } else {
      goTo(index);
    }
  }

  track.addEventListener(
    "touchstart",
    (e) => onStart(e.touches[0].clientX),
    { passive: true }
  );
  track.addEventListener(
    "touchmove",
    (e) => onMove(e.touches[0].clientX),
    { passive: true }
  );
  track.addEventListener("touchend", onEnd);

  track.addEventListener("mousedown", (e) => {
    e.preventDefault();
    onStart(e.clientX);
  });
  window.addEventListener("mousemove", (e) => {
    if (isDragging) onMove(e.clientX);
  });
  window.addEventListener("mouseup", onEnd);

  window.addEventListener("resize", () => goTo(index, false));
  measure();
  goTo(0, false);
}
