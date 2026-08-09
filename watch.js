// watch.js - WaveMirror Dedicated Streaming Player Page Controller

let activeMovie = null;
let currentId = null;
let currentType = "movie";
let currentServer = 1;
let currentImdb = "";
let blockedPopupsCount = 0;

// Global Ad & Popup Shield Override (Blocks window.open popups)
window.open = function(url, target, features) {
    blockedPopupsCount++;
    console.warn(`[Shield] Intercepted popup #${blockedPopupsCount} attempt to: ${url}`);
    showToast("🛡️ Ad Popup Intercepted");
    return null;
};

// Automatic Focus Guard (Prevents external tabs from taking window focus)
window.addEventListener("blur", () => {
    if (document.activeElement && document.activeElement.tagName === "IFRAME") {
        console.warn("[Shield] User clicked inside player iframe. Focusing window back...");
        setTimeout(() => {
            window.focus();
        }, 100);
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    // Load saved accent color
    const savedAccent = localStorage.getItem("wavemirror_accent_color");
    if (savedAccent) {
        setGlobalAccent(savedAccent);
    }

    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    currentId = params.get("id");
    currentType = params.get("type") || "movie";

    if (!currentId) {
        showToast("Error: No media selected!");
        setTimeout(() => { window.location.href = "./"; }, 1500);
        return;
    }

    await initializePlayer();
});

async function initializePlayer() {
    const title = document.getElementById("modalTitle");
    const overview = document.getElementById("modalOverview");
    const tvControls = document.getElementById("tvControls");

    title.innerText = "Loading stream...";
    overview.innerText = "Connecting to TMDB API & stream servers...";

    // Fetch details
    let movie = await fetchStreamDetails(currentId, currentType);
    if (!movie) {
        movie = { title: "Media Stream", year: "----", rating: "0.0", duration: "0h", overview: "Stream exclusive titles on WaveMirror." };
    }
    activeMovie = movie;
    currentImdb = movie.imdbId || movie.id;

    // Populate Info
    title.innerText = movie.title;
    document.getElementById("modalYear").innerText = movie.year;
    document.getElementById("modalRating").innerText = `★ ${movie.rating}`;
    document.getElementById("modalDuration").innerText = movie.duration;
    overview.innerText = movie.overview;
    document.getElementById("modalDirector").innerText = movie.director || "Featured Director";
    document.getElementById("modalCast").innerText = movie.cast ? movie.cast.join(", ") : "Lead Actor";
    document.getElementById("modalGenres").innerText = movie.genres ? movie.genres.join(" • ") : "Action";

    // Watchlist state check
    updateWatchlistButton();

    if (currentType === "tv") {
        tvControls.style.display = "flex";
        tvControls.classList.remove("hidden");
        generateSeasonEpisodeDropdowns(movie.seasonsCount || 1);
        updateTvStream();
    } else {
        tvControls.style.display = "none";
        tvControls.classList.add("hidden");
        loadServer(1);
    }
}

function loadServer(num, btnElement = null) {
    currentServer = num;
    const iframe = document.getElementById("playerIframe");
    if (!iframe) return;

    if (currentType === "tv") {
        updateTvStream();
    } else {
        if (num === 1) {
            iframe.src = `https://vidlink.pro/movie/${currentId}`;
        } else if (num === 2) {
            iframe.src = `https://vidsrc.xyz/embed/movie/${currentImdb}`;
        } else if (num === 3) {
            iframe.src = `https://vidsrc.cc/embed/movie/${currentId}`;
        } else {
            iframe.src = `https://autoembed.cc/embed/movie/${currentId}`;
        }
    }

    if (btnElement) {
        const buttons = document.querySelectorAll(".server-btn");
        buttons.forEach(b => b.classList.remove("active"));
        btnElement.classList.add("active");
    }
}

function generateSeasonEpisodeDropdowns(seasonsCount) {
    const seasonSelect = document.getElementById("seasonSelect");
    const episodeSelect = document.getElementById("episodeSelect");

    seasonSelect.innerHTML = Array.from({length: seasonsCount}, (_, i) => `<option value="${i+1}">Season ${i+1}</option>`).join('');
    episodeSelect.innerHTML = Array.from({length: 24}, (_, i) => `<option value="${i+1}">Episode ${i+1}</option>`).join('');
}

function updateTvStream() {
    const s = document.getElementById("seasonSelect").value || 1;
    const e = document.getElementById("episodeSelect").value || 1;
    const iframe = document.getElementById("playerIframe");
    if (!iframe) return;

    if (currentServer === 1) {
        iframe.src = `https://vidlink.pro/tv/${currentId}/${s}/${e}`;
    } else if (currentServer === 2) {
        iframe.src = `https://vidsrc.xyz/embed/tv/${currentId}/${s}-${e}`;
    } else if (currentServer === 3) {
        iframe.src = `https://vidsrc.cc/embed/tv/${currentId}/${s}/${e}`;
    } else {
        iframe.src = `https://autoembed.cc/embed/tv/${currentId}/${s}/${e}`;
    }
}

function closeAdOverlay() {
    const iframe = document.getElementById("playerIframe");
    if (!iframe) return;
    const currentSrc = iframe.src;
    iframe.src = "about:blank";
    setTimeout(() => {
        iframe.src = currentSrc;
        showToast("⚡ Player Cleaned & Ad Overlay Cleared");
    }, 100);
}

function handleWatchlistToggle() {
    if (!activeMovie) return;
    // Load local watchlist
    let watchlist = JSON.parse(localStorage.getItem("wavemirror_watchlist")) || [];
    const index = watchlist.findIndex(m => String(m.id) === String(activeMovie.id));
    
    if (index === -1) {
        watchlist.push(activeMovie);
        localStorage.setItem("wavemirror_watchlist", JSON.stringify(watchlist));
        showToast(`Added "${activeMovie.title}" to Watchlist`);
    } else {
        watchlist.splice(index, 1);
        localStorage.setItem("wavemirror_watchlist", JSON.stringify(watchlist));
        showToast(`Removed "${activeMovie.title}" from Watchlist`);
    }
    updateWatchlistButton();
}

function updateWatchlistButton() {
    const btn = document.getElementById("modalWatchlistBtn");
    if (!btn || !activeMovie) return;
    
    let watchlist = JSON.parse(localStorage.getItem("wavemirror_watchlist")) || [];
    const inWatchlist = watchlist.some(m => String(m.id) === String(activeMovie.id));
    btn.innerText = inWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist";
}

function startWatchPartyFromPlayer() {
    if (!currentId) return;
    // Redirect to watch party screen on homepage with movie query params
    window.location.href = `./?startParty=true&movieId=${currentId}&type=${currentType}&server=${currentServer}`;
}

function setGlobalAccent(colorHex) {
    document.documentElement.style.setProperty("--primary-gold", colorHex);
    document.documentElement.style.setProperty("--primary-neon", colorHex);
    document.documentElement.style.setProperty("--border-glass", `rgba(${hexToRgbValues(colorHex)}, 0.15)`);
    document.documentElement.style.setProperty("--border-glow", `rgba(${hexToRgbValues(colorHex)}, 0.4)`);
}

function hexToRgbValues(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "255, 215, 0";
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// Simple Toast Helper
function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add("active"); }, 50);
    setTimeout(() => {
        toast.classList.remove("active");
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
