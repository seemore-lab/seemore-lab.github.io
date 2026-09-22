/* SeemoreLab — interactions (sans dépendance) */
(() => {
  document.documentElement.classList.add("js");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---- Hero : version horizontale ou verticale selon l'écran ---- */
  const hero = document.querySelector(".hero__video");
  const portrait = matchMedia("(orientation: portrait) and (max-width: 900px)");
  const setHero = () => {
    const k = portrait.matches ? "portrait" : "landscape";
    const src = hero.dataset[k];
    if (hero.getAttribute("src") === src) return;
    hero.poster = hero.dataset["poster" + k[0].toUpperCase() + k.slice(1)];
    hero.src = src;
    if (!reduced) hero.play().catch(() => {});
  };
  hero.addEventListener("playing", () => hero.classList.add("is-ready"));
  hero.addEventListener("loadeddata", () => hero.classList.add("is-ready"));
  setHero();
  portrait.addEventListener("change", setHero);

  /* ---- Ouverture toujours en haut de page ---- */
  if (window.__hadHash) {
    scrollTo(0, 0);
    addEventListener("load", () => scrollTo(0, 0));
  }

  /* ---- Navigation : fond au défilement ---- */
  const nav = document.querySelector(".nav");

  /* Menu plein écran (téléphone) */
  const toggle = nav.querySelector(".nav__toggle");
  const setMenu = (open) => {
    nav.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Fermer" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("menu-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* Liens internes : défilement sans modifier l'adresse (le lien partagé reste propre) */
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = id === "top" ? document.body : document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }));
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Apparitions ---- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => revealIO.observe(el));

  /* ---- Aperçus : chargés à l'approche, lus seulement à l'écran ---- */
  const previews = [...document.querySelectorAll(".work__media video")];
  const loadIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const v = e.target;
      v.poster = v.dataset.poster;
      if (!saveData) { v.src = v.dataset.src; v.preload = "auto"; }
      loadIO.unobserve(v);
    });
  }, { rootMargin: "600px 0px" });
  const playIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      v._visible = e.isIntersecting;
      if (e.isIntersecting && !reduced && !saveData && !lightbox.open) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.2 });
  previews.forEach((v) => { loadIO.observe(v); playIO.observe(v); });

  /* ---- Lightbox : film complet avec le son ---- */
  const lightbox = document.querySelector(".lightbox");
  const frame = lightbox.querySelector(".lightbox__frame");
  const lbTitle = lightbox.querySelector(".lightbox__title");

  // Transforme un lien Vimeo / YouTube collé tel quel en lecteur intégré
  const embedUrl = (url) => {
    let m;
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-z0-9]+))?/i)))
      return `https://player.vimeo.com/video/${m[1]}?autoplay=1&dnt=1${m[2] ? "&h=" + m[2] : ""}`;
    if ((m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/)))
      return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`;
    return url;
  };

  const open = (btn) => {
    previews.forEach((v) => v.pause());
    hero.pause();
    frame.innerHTML = "";
    const embed = (btn.dataset.embed || "").trim();
    if (embed) {
      const f = document.createElement("iframe");
      f.src = embedUrl(embed);
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.allowFullscreen = true;
      f.title = btn.dataset.title;
      frame.append(f);
    } else {
      const v = document.createElement("video");
      v.src = btn.dataset.full;
      v.controls = true; v.playsInline = true; v.autoplay = true;
      v.poster = btn.querySelector("video").dataset.poster;
      frame.append(v);
      v.play().catch(() => {});
    }
    lbTitle.textContent = btn.dataset.title;
    lightbox.showModal();
    requestAnimationFrame(() => lightbox.classList.add("is-visible"));
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.classList.remove("is-visible");
    setTimeout(() => { lightbox.close(); }, 300);
  };
  lightbox.addEventListener("close", () => {
    frame.innerHTML = "";
    document.body.style.overflow = "";
    if (!reduced) hero.play().catch(() => {});
    previews.forEach((v) => { if (v._visible && v.src && !reduced) v.play().catch(() => {}); });
  });
  lightbox.querySelector(".lightbox__close").addEventListener("click", close);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target === frame) close(); });
  lightbox.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && lightbox.open) close(); });

  document.querySelectorAll(".work__media").forEach((btn) =>
    btn.addEventListener("click", () => open(btn)));

  /* ---- Curseur « Voir » (souris uniquement) ---- */
  const cursor = document.querySelector(".cursor");
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    const tick = () => {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cursor.style.translate = `${cx}px ${cy}px`;
      requestAnimationFrame(tick);
    };
    tick();
    document.querySelectorAll(".work__media").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-on"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    });
    lightbox.addEventListener("close", () => cursor.classList.remove("is-on"));
  }
})();
