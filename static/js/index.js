(function () {
  const videos = Array.from(document.querySelectorAll("video"));
  const modal = document.getElementById("video-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalVideoWrap = document.getElementById("modal-video-wrap");
  const modalClose = modal ? modal.querySelector(".modal-close") : null;
  const interactiveItems = Array.from(document.querySelectorAll(".demo-item-interactive"));

  function lockMuted(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.setAttribute("muted", "");
    video.setAttribute("defaultMuted", "");
  }

  function hardenVideo(video) {
    lockMuted(video);
    video.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
    video.setAttribute("disablepictureinpicture", "");
    video.setAttribute("disableRemotePlayback", "");
    video.addEventListener("volumechange", function () {
      if (!video.muted || video.volume !== 0) {
        lockMuted(video);
      }
    });
  }

  videos.forEach(function (video) {
    hardenVideo(video);
  });

  function pausePageVideos() {
    videos.forEach(function (video) {
      video.pause();
    });
  }

  function resumeAutoplayVideos() {
    videos.forEach(function (video) {
      if (video.hasAttribute("autoplay")) {
        video.play().catch(function () {});
      }
    });
  }

  function closeVideoModal() {
    if (!modal) {
      return;
    }

    const modalVideos = Array.from(modal.querySelectorAll("video"));
    modalVideos.forEach(function (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    });

    modalVideoWrap.replaceChildren();
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    resumeAutoplayVideos();
  }

  function openVideoModal(title, src) {
    if (!modal || !modalTitle || !modalVideoWrap || !src) {
      return;
    }

    pausePageVideos();
    modalVideoWrap.replaceChildren();
    modalTitle.textContent = title || "";

    const video = document.createElement("video");
    const source = document.createElement("source");

    source.src = src;
    source.type = "video/mp4";
    video.controls = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = "metadata";
    video.appendChild(source);
    hardenVideo(video);

    modalVideoWrap.appendChild(video);
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    video.play().catch(function () {});
  }

  interactiveItems.forEach(function (item) {
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    item.addEventListener("click", function () {
      openVideoModal(item.dataset.modalTitle, item.dataset.modalSrc);
    });

    item.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openVideoModal(item.dataset.modalTitle, item.dataset.modalSrc);
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeVideoModal);
  }

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeVideoModal();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && modal.classList.contains("active")) {
      closeVideoModal();
    }
  });
})();
