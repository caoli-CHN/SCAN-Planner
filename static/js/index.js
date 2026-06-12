(function () {
  const videos = Array.from(document.querySelectorAll("video[data-src]"));
  const sections = Array.from(document.querySelectorAll(".snap-section"));
  const navButtons = Array.from(document.querySelectorAll("[data-section-target]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let snapLocked = false;

  function lockMuted(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  }

  function loadVideo(video) {
    if (video.dataset.loaded === "true") {
      return;
    }

    const source = document.createElement("source");
    source.src = video.dataset.src;
    source.type = "video/mp4";
    video.appendChild(source);
    video.dataset.loaded = "true";
    video.load();
  }

  function playVideo(video) {
    lockMuted(video);
    loadVideo(video);

    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function sectionIndexById(id) {
    return sections.findIndex(function (section) {
      return section.id === id || section.dataset.section === id;
    });
  }

  function setActiveSection(index) {
    activeIndex = Math.max(0, Math.min(index, sections.length - 1));
    const activeSection = sections[activeIndex];
    const activeId = activeSection ? activeSection.dataset.section : "";

    navButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.sectionTarget === activeId);
    });
  }

  function scrollToSection(index) {
    if (!sections[index]) {
      return;
    }

    setActiveSection(index);
    sections[index].scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function snapToRelative(direction) {
    if (snapLocked || direction === 0) {
      return;
    }

    const targetIndex = Math.max(0, Math.min(activeIndex + direction, sections.length - 1));
    if (targetIndex === activeIndex) {
      return;
    }

    snapLocked = true;
    scrollToSection(targetIndex);

    window.setTimeout(function () {
      snapLocked = false;
    }, reduceMotion ? 120 : 850);
  }

  videos.forEach(function (video) {
    video.dataset.loaded = "false";
    lockMuted(video);
    video.addEventListener("volumechange", function () {
      if (!video.muted || video.volume !== 0) {
        lockMuted(video);
      }
    });
  });

  navButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const index = sectionIndexById(button.dataset.sectionTarget);
      scrollToSection(index);
    });
  });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          const index = sections.indexOf(entry.target);
          if (index >= 0) {
            setActiveSection(index);
          }
        });
      },
      {
        root: null,
        threshold: 0.62
      }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });

    const videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const video = entry.target;

          if (entry.isIntersecting) {
            playVideo(video);
          } else {
            video.pause();
          }
        });
      },
      {
        root: null,
        rootMargin: "280px 0px",
        threshold: 0.24
      }
    );

    videos.forEach(function (video) {
      videoObserver.observe(video);
    });
  } else {
    videos.forEach(loadVideo);
  }

  window.addEventListener(
    "wheel",
    function (event) {
      if (Math.abs(event.deltaY) < 36 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      snapToRelative(event.deltaY > 0 ? 1 : -1);
    },
    { passive: false }
  );

  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      snapToRelative(1);
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      snapToRelative(-1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      scrollToSection(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      scrollToSection(sections.length - 1);
    }
  });

  setActiveSection(0);
})();
