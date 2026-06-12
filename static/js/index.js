(function () {
  const videos = Array.from(document.querySelectorAll("video[data-src]"));
  const reel = document.querySelector(".hero-reel");
  const reelTrack = document.querySelector(".reel-track");
  const reelSlides = Array.from(document.querySelectorAll("[data-reel-slide]"));
  const reelDots = Array.from(document.querySelectorAll("[data-reel-index]"));
  const reelPrev = document.querySelector("[data-reel-prev]");
  const reelNext = document.querySelector("[data-reel-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let reelIndex = 0;
  let reelVisible = false;
  let reelTimer = null;

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

  function isReelVideo(video) {
    return video.classList.contains("reel-video");
  }

  function getReelVideo(index) {
    const slide = reelSlides[index];
    return slide ? slide.querySelector("video") : null;
  }

  function setReelIndex(nextIndex) {
    if (!reelTrack || reelSlides.length === 0) {
      return;
    }

    reelIndex = (nextIndex + reelSlides.length) % reelSlides.length;
    reelTrack.style.transform = "translateX(-" + reelIndex * 100 + "%)";

    reelSlides.forEach(function (slide, index) {
      slide.classList.toggle("is-active", index === reelIndex);
      const video = slide.querySelector("video");
      if (!video) {
        return;
      }
      if (index === reelIndex && reelVisible) {
        playVideo(video);
      } else {
        video.pause();
      }
    });

    reelDots.forEach(function (dot, index) {
      dot.classList.toggle("is-active", index === reelIndex);
    });
  }

  function resetReelTimer() {
    if (reelTimer) {
      window.clearInterval(reelTimer);
    }

    if (reduceMotion || reelSlides.length < 2) {
      return;
    }

    reelTimer = window.setInterval(function () {
      if (reelVisible) {
        setReelIndex(reelIndex + 1);
      }
    }, 6500);
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

  if (reelPrev) {
    reelPrev.addEventListener("click", function () {
      setReelIndex(reelIndex - 1);
      resetReelTimer();
    });
  }

  if (reelNext) {
    reelNext.addEventListener("click", function () {
      setReelIndex(reelIndex + 1);
      resetReelTimer();
    });
  }

  reelDots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setReelIndex(Number(dot.dataset.reelIndex));
      resetReelTimer();
    });
  });

  if (!("IntersectionObserver" in window)) {
    videos.forEach(loadVideo);
    reelVisible = true;
    setReelIndex(0);
    resetReelTimer();
    return;
  }

  const reelObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        reelVisible = entry.isIntersecting;
        const activeVideo = getReelVideo(reelIndex);
        if (!activeVideo) {
          return;
        }
        if (reelVisible) {
          playVideo(activeVideo);
        } else {
          activeVideo.pause();
        }
      });
    },
    {
      root: null,
      threshold: 0.25
    }
  );

  if (reel) {
    reelObserver.observe(reel);
  }

  const videoObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        const video = entry.target;
        if (isReelVideo(video)) {
          return;
        }

        if (entry.isIntersecting) {
          playVideo(video);
        } else {
          video.pause();
        }
      });
    },
    {
      root: null,
      rootMargin: "360px 0px",
      threshold: 0.22
    }
  );

  videos.forEach(function (video) {
    if (!isReelVideo(video)) {
      videoObserver.observe(video);
    }
  });

  setReelIndex(0);
  resetReelTimer();
})();
