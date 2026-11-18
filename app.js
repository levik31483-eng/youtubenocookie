"use strict";

const form = document.querySelector("#link-form");
const app = document.querySelector(".app");
const input = document.querySelector("#youtube-link");
const message = document.querySelector("#message");
const playerSection = document.querySelector("#player-section");
const playerFrame = document.querySelector("#player-frame");
const player = document.querySelector("#video-player");
const convertedUrl = document.querySelector("#converted-url");
const copyButton = document.querySelector("#copy-button");
const fullscreenButton = document.querySelector("#fullscreen-button");

function getVideoId(value) {
  const trimmed = value.trim();
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url;

  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const youtubeHosts = new Set(["youtube.com", "m.youtube.com", "youtube-nocookie.com"]);
  let id = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0];
  } else if (youtubeHosts.has(host)) {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
      id = match?.[1] ?? null;
    }
  }

  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

async function enterFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await playerFrame.requestFullscreen();
    }
    playerSection.classList.remove("fullscreen-failed");
  } catch {
    playerSection.classList.add("fullscreen-failed");
    message.textContent = "Your browser blocked fullscreen. Use the player controls or the button below.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";
  const videoId = getVideoId(input.value);

  if (!videoId) {
    message.textContent = "Enter a valid YouTube watch, short, or youtu.be link.";
    input.focus();
    return;
  }

  const url = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  app.classList.add("has-player");
  playerSection.hidden = false;
  playerSection.classList.remove("fullscreen-failed");
  player.src = url;
  convertedUrl.href = url;
  convertedUrl.textContent = url;
  enterFullscreen();
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(convertedUrl.href);
    copyButton.textContent = "Copied!";
    window.setTimeout(() => {
      copyButton.textContent = "Copy link";
    }, 1600);
  } catch {
    message.textContent = "Could not copy the link. Select and copy it from the player details.";
  }
});

fullscreenButton.addEventListener("click", enterFullscreen);
