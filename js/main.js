function silenceVideo(video) {
  const lock = () => {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  };
  lock();
  video.setAttribute("muted", "");
  video.setAttribute("defaultMuted", "");
  video.setAttribute("playsinline", "");
  video.playsInline = true;
  video.controlsList = "nodownload noplaybackrate noremoteplayback";
  video.disablePictureInPicture = true;
  if (!video.dataset.silenceBound) {
    video.dataset.silenceBound = "1";
    video.addEventListener("volumechange", lock);
    video.addEventListener("play", lock);
    video.addEventListener("playing", lock);
    video.addEventListener("loadeddata", lock);
  }
}

function tryLoadVideo(slot) {
  const src = slot.dataset.src;
  if (!src) return;
  const video = slot.querySelector("video");
  if (!video) return;
  silenceVideo(video);

  const probe = document.createElement("video");
  probe.preload = "metadata";
  probe.muted = true;
  probe.volume = 0;
  probe.src = src;
  probe.addEventListener("loadedmetadata", () => {
    video.src = src;
    silenceVideo(video);
    video.loop = true;
    video.controls = true;
    slot.classList.add("has-video");
    video.play().catch(() => {});
  });
  probe.addEventListener("error", () => {
    slot.classList.remove("has-video");
  });
}

function playVideosIn(panel) {
  panel.querySelectorAll("video").forEach((video) => {
    silenceVideo(video);
    if (video.getAttribute("src") || video.src) video.play().catch(() => {});
  });
}

function pauseVideosIn(panel) {
  panel.querySelectorAll("video").forEach((video) => video.pause());
}

function setupTabs() {
  const tabs = document.querySelectorAll(".task-tabs button");
  const panels = document.querySelectorAll(".task-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.task;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((p) => {
        const on = p.id === `task-${id}`;
        p.classList.toggle("active", on);
        if (on) playVideosIn(p);
        else pauseVideosIn(p);
      });
    });
  });
}

function setupLightbox() {
  const box = document.querySelector(".lightbox");
  const img = box.querySelector("img");
  document.querySelectorAll("[data-zoom]").forEach((node) => {
    node.addEventListener("click", () => {
      const src = node.dataset.zoom || node.getAttribute("src");
      img.src = src;
      box.classList.add("open");
    });
  });
  box.addEventListener("click", () => box.classList.remove("open"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") box.classList.remove("open");
  });
}

function setupScrollSpy() {
  const links = [...document.querySelectorAll(".nav-links a")];
  const ids = links.map((a) => a.getAttribute("href")).filter((h) => h && h.startsWith("#"));
  const sections = ids.map((id) => document.querySelector(id)).filter(Boolean);
  if (!sections.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => io.observe(s));
}

function setupCopy() {
  const btn = document.querySelector(".copy-btn");
  const pre = document.querySelector("#bibtex");
  if (!btn || !pre) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pre.innerText);
      btn.textContent = "Copied";
      setTimeout(() => (btn.textContent = "Copy"), 1400);
    } catch {
      btn.textContent = "Select to copy";
    }
  });
}

function setupNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => links.classList.remove("open"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".video-slot[data-src]").forEach(tryLoadVideo);
  setupTabs();
  setupLightbox();
  setupScrollSpy();
  setupCopy();
  setupNavToggle();
});
