(function () {
  const videos = Array.from(document.querySelectorAll("video"));

  function lockMuted(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  }

  videos.forEach(function (video) {
    lockMuted(video);
    video.addEventListener("volumechange", function () {
      if (!video.muted || video.volume !== 0) {
        lockMuted(video);
      }
    });
  });
})();
