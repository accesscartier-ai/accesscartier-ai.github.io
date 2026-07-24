(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var themeLabel = document.getElementById("themeLabel");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var currentTheme = prefersDark ? "dark" : "light";

  function applyTheme(theme) {
    currentTheme = theme;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      themeLabel.textContent = "Light mode";
      themeToggle.setAttribute("aria-pressed", "true");
    } else {
      root.removeAttribute("data-theme");
      themeLabel.textContent = "Dark mode";
      themeToggle.setAttribute("aria-pressed", "false");
    }
  }
  applyTheme(currentTheme);
  themeToggle.addEventListener("click", function () {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  /* ---------- Mobile nav ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileNav = document.getElementById("mobileNav");

  menuToggle.addEventListener("click", function () {
    var isOpen = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Scroll progress + active rail link ---------- */
  var progressBar = document.getElementById("progressBar");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id], .hero[id]"));
  var railLinks = Array.prototype.slice.call(document.querySelectorAll(".rail-link"));

  function onScroll() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    progressBar.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + "%";

    var pos = scrollTop + 140;
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec;
    });
    railLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Skill proficiency units ---------- */
  document.querySelectorAll(".units").forEach(function (el) {
    var level = parseInt(el.getAttribute("data-level"), 10) || 0;
    for (var i = 1; i <= 5; i++) {
      var span = document.createElement("span");
      span.className = "unit" + (i <= level ? " filled" : "");
      el.appendChild(span);
    }
  });

  /* ---------- Command palette ---------- */
  var paletteBtn = document.getElementById("paletteBtn");
  var paletteBackdrop = document.getElementById("paletteBackdrop");
  var paletteInput = document.getElementById("paletteInput");
  var paletteList = document.getElementById("paletteList");

  var commands = [
    { label: "Index", hint: "section", href: "#home" },
    { label: "About", hint: "section", href: "#about" },
    { label: "Skills", hint: "section", href: "#skills" },
    { label: "Projects", hint: "section", href: "#projects" },
    { label: "Resume", hint: "section", href: "#resume" },
    { label: "Contact", hint: "section", href: "#contact" },
    { label: "Download CV", hint: "pdf", href: "Ayanda_Ngcaku_Professional_CV.pdf", download: true },
    { label: "Open GitHub", hint: "↗ external", href: "https://github.com/accesscartier-ai", external: true },
    { label: "Open LinkedIn", hint: "↗ external", href: "https://www.linkedin.com/in/ayanda-ngcaku-970112363/", external: true },
    { label: "Email Ayanda", hint: "mailto", href: "mailto:ayandangcaku12@gmail.com" },
    { label: "Toggle dark mode", hint: "action", action: function () { applyTheme(currentTheme === "dark" ? "light" : "dark"); } }
  ];

  var activeIndex = 0;
  var filtered = commands.slice();

  function renderPalette() {
    paletteList.innerHTML = "";
    if (!filtered.length) {
      var empty = document.createElement("div");
      empty.className = "palette-empty";
      empty.textContent = "No matches.";
      paletteList.appendChild(empty);
      return;
    }
    filtered.forEach(function (cmd, i) {
      var item = document.createElement("div");
      item.className = "palette-item" + (i === activeIndex ? " active" : "");
      item.setAttribute("role", "option");
      item.innerHTML = "<span>" + cmd.label + "</span><span class='p-hint'>" + cmd.hint + "</span>";
      item.addEventListener("mouseenter", function () { activeIndex = i; renderPalette(); });
      item.addEventListener("click", function () { runCommand(cmd); });
      paletteList.appendChild(item);
    });
  }

  function runCommand(cmd) {
    closePalette();
    if (cmd.action) { cmd.action(); return; }
    if (cmd.download) {
      var a = document.createElement("a");
      a.href = cmd.href; a.setAttribute("download", ""); document.body.appendChild(a); a.click(); a.remove();
      return;
    }
    if (cmd.external) { window.open(cmd.href, "_blank", "noopener,noreferrer"); return; }
    window.location.hash = cmd.href;
  }

  function openPalette() {
    paletteBackdrop.classList.add("open");
    paletteInput.value = "";
    filtered = commands.slice();
    activeIndex = 0;
    renderPalette();
    setTimeout(function () { paletteInput.focus(); }, 10);
  }
  function closePalette() {
    paletteBackdrop.classList.remove("open");
    paletteBtn.focus();
  }

  paletteBtn.addEventListener("click", openPalette);
  paletteBackdrop.addEventListener("click", function (e) {
    if (e.target === paletteBackdrop) closePalette();
  });

  paletteInput.addEventListener("input", function () {
    var q = paletteInput.value.trim().toLowerCase();
    filtered = commands.filter(function (c) { return c.label.toLowerCase().indexOf(q) !== -1; });
    activeIndex = 0;
    renderPalette();
  });

  paletteInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); renderPalette(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); renderPalette(); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[activeIndex]) runCommand(filtered[activeIndex]); }
    else if (e.key === "Escape") { closePalette(); }
  });

  document.addEventListener("keydown", function (e) {
    var isMeta = e.metaKey || e.ctrlKey;
    if (isMeta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (paletteBackdrop.classList.contains("open")) closePalette(); else openPalette();
    }
    if (e.key === "Escape" && paletteBackdrop.classList.contains("open")) closePalette();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
