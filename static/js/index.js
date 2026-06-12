(function () {
  const videos = Array.from(document.querySelectorAll("video[data-src]"));

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

  videos.forEach(function (video) {
    video.dataset.loaded = "false";
    lockMuted(video);
    video.addEventListener("volumechange", function () {
      if (!video.muted || video.volume !== 0) {
        lockMuted(video);
      }
    });
  });

  if (!("IntersectionObserver" in window)) {
    videos.forEach(loadVideo);
    return;
  }

  const observer = new IntersectionObserver(
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
      rootMargin: "420px 0px",
      threshold: 0.18
    }
  );

  videos.forEach(function (video) {
    observer.observe(video);
  });
})();
