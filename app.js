// WaveMirror Application Engine - Powered by TMDB API (apikey: fea469f5e20796590292a227a92a2fef)

let currentCatalog = [...FEATURED_MOVIES];
let activeGenre = "All";
let activeMovie = null;
let heroSlideIndex = 0;
let heroTimer = null;
let searchDebounce = null;

// Global Stream & Shield State
window.currentId = null;
window.currentType = "movie";
window.currentImdb = null;
window.currentServer = 1;
let blockedPopupsCount = 0;

// Global Ad & Popup Shield Override (Blocks window.open popups)
window.open = function(url, target, features) {
    blockedPopupsCount++;
    console.warn(`[Shield] Intercepted popup #${blockedPopupsCount} attempt to: ${url}`);
    const statusText = document.getElementById("shieldStatus");
    if (statusText) {
        statusText.innerText = `🛡️ Popup Shield Active (${blockedPopupsCount} Ad Popups Intercepted)`;
    }
    showToast("🛡️ Ad Popup Intercepted");
    return null;
};

// Automatic Focus Guard (Prevents external tabs from taking window focus)
window.addEventListener("blur", () => {
    if (document.activeElement && document.activeElement.tagName === "IFRAME") {
        setTimeout(() => {
            window.focus();
        }, 150);
    }
});

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

async function initApp() {
    showLoader(true);
    
    try {
        const [liveMovies, liveSeries] = await Promise.all([
            fetchLiveTrendingMovies(),
            fetchLiveTrendingSeries()
        ]);

        if (liveMovies && liveMovies.length > 0) {
            currentCatalog = liveMovies;
        }

        renderHeroSlider();
        renderTop10Rail(liveMovies);
        renderMovieGrid(currentCatalog);

        if (liveSeries && liveSeries.length > 0) {
            renderSeriesGrid(liveSeries);
        } else {
            renderSeriesGrid();
        }
    } catch (e) {
        console.warn("Falling back to pre-loaded dataset:", e);
        renderHeroSlider();
        renderTop10Rail(FEATURED_MOVIES);
        renderMovieGrid(FEATURED_MOVIES);
        renderSeriesGrid();
    }

    updateWatchlistUI();
    initScrollEffects();
    showLoader(false);
}

function showLoader(show) {
    const loader = document.getElementById("global-loader");
    if (!loader) return;
    if (show) {
        loader.classList.remove("hidden");
    } else {
        setTimeout(() => loader.classList.add("hidden"), 300);
    }
}

/* ---------------- Hero Spotlight Slider ---------------- */
function renderHeroSlider() {
    const slider = document.getElementById("heroSlider");
    const dots = document.getElementById("heroDots");
    if (!slider || !dots) return;

    const featuredList = currentCatalog.slice(0, 5);
    
    slider.innerHTML = featuredList.map((movie, idx) => `
        <div class="hero-slide ${idx === 0 ? 'active' : ''}" id="slide-${idx}">
            <img class="hero-backdrop" src="${movie.backdrop}" alt="${movie.title}" loading="${idx === 0 ? 'eager' : 'lazy'}">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <span class="hero-tag">TMDB FEATURED ${movie.type.toUpperCase()}</span>
                <h1 class="hero-title">${movie.title}</h1>
                <div class="hero-meta">
                    <span class="rating-imdb">★ ${movie.rating}</span>
                    <span class="meta-badge">${movie.year}</span>
                    <span class="meta-badge">${movie.quality || '4K'}</span>
                    <span>${movie.duration}</span>
                </div>
                <p class="hero-overview">${movie.overview}</p>
                <div class="hero-actions">
                    <button class="btn-primary" onclick="openPlayerModal('${movie.id}', '${movie.type}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        Play Free Stream
                    </button>
                    <button class="btn-secondary" onclick="toggleWatchlistFromHero('${movie.id}')">
                        ${isInWatchlist(movie.id) ? '✓ Saved' : '+ Watchlist'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    dots.innerHTML = featuredList.map((_, idx) => `
        <div class="hero-dot ${idx === 0 ? 'active' : ''}" onclick="goToHeroSlide(${idx})"></div>
    `).join('');

    startHeroTimer();
}

function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => {
        const featuredCount = Math.min(5, currentCatalog.length);
        heroSlideIndex = (heroSlideIndex + 1) % featuredCount;
        goToHeroSlide(heroSlideIndex);
    }, 6000);
}

function goToHeroSlide(index) {
    heroSlideIndex = index;
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");

    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

/* ---------------- Top 10 Ranked Rail ---------------- */
function renderTop10Rail(list = currentCatalog) {
    const rail = document.getElementById("top10Grid");
    if (!rail) return;

    const top10Items = list.slice(0, 10);
    rail.innerHTML = top10Items.map((movie, idx) => `
        <div class="top10-card" onclick="openPlayerModal('${movie.id}', '${movie.type}')">
            <span class="rank-number">${idx + 1}</span>
            <div class="movie-card" style="margin-left: 15px;">
                <div class="poster-wrapper">
                    <img class="poster-img" src="${movie.poster}" alt="${movie.title}" loading="lazy">
                    <span class="card-quality-badge">${movie.quality || '4K'}</span>
                    <div class="card-overlay">
                        <div class="play-icon-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                </div>
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-subinfo">
                        <span>${movie.year}</span>
                        <span style="color: var(--accent-gold); font-weight:700;">★ ${movie.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/* ---------------- Catalog & Genre Explorer ---------------- */
async function filterGenre(genre) {
    activeGenre = genre;
    const chips = document.querySelectorAll(".genre-chip");
    chips.forEach(chip => {
        chip.classList.toggle("active", chip.innerText === genre || (genre === "All" && chip.innerText === "All Titles"));
    });

    if (genre === "All") {
        renderMovieGrid(currentCatalog);
        return;
    }

    showLoader(true);
    const liveGenreMovies = await fetchLiveGenreMovies(genre);
    showLoader(false);

    if (liveGenreMovies && liveGenreMovies.length > 0) {
        renderMovieGrid(liveGenreMovies);
    } else {
        const filtered = currentCatalog.filter(m => m.genres && m.genres.includes(genre));
        renderMovieGrid(filtered);
    }
}

function renderMovieGrid(itemsToRender = currentCatalog) {
    const grid = document.getElementById("movieGrid");
    if (!grid) return;

    if (!itemsToRender || itemsToRender.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3>No titles found</h3>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Try another search term or genre filter.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = itemsToRender.map(movie => createMovieCardHTML(movie)).join('');
}

function renderSeriesGrid(seriesList = null) {
    const grid = document.getElementById("seriesGrid");
    if (!grid) return;

    const list = seriesList || currentCatalog.filter(m => m.type === "tv");
    grid.innerHTML = list.map(show => createMovieCardHTML(show)).join('');
}

function createMovieCardHTML(movie) {
    return `
        <div class="movie-card" onclick="openPlayerModal('${movie.id}', '${movie.type || 'movie'}')">
            <div class="poster-wrapper">
                <img class="poster-img" src="${movie.poster}" alt="${movie.title}" loading="lazy">
                <span class="card-badge-top">★ ${movie.rating}</span>
                <span class="card-quality-badge">${movie.quality || '4K'}</span>
                <div class="card-overlay">
                    <div class="play-icon-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
            </div>
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-subinfo">
                    <span>${movie.year}</span>
                    <span>${movie.duration}</span>
                </div>
            </div>
        </div>
    `;
}

/* ---------------- Predictive Real-Time TMDB Search ---------------- */
function handleSearch(event) {
    const query = event.target.value.trim();
    clearTimeout(searchDebounce);

    if (query.length < 2) {
        document.getElementById("exploreHeaderTitle").innerText = "Explore Catalog";
        renderMovieGrid(currentCatalog);
        return;
    }

    searchDebounce = setTimeout(async () => {
        showLoader(true);
        const searchResults = await fetchLiveSearch(query);
        showLoader(false);
        
        document.getElementById("exploreHeaderTitle").innerText = `TMDB Search: "${query}"`;
        scrollToSection('explore');
        renderMovieGrid(searchResults);
    }, 400);
}

/* ---------------- In-App Player & vidsrc Stream Engine ---------------- */
async function openPlayerModal(id, mediaType = "movie") {
    const modal = document.getElementById("playerModal");
    const iframe = document.getElementById("playerIframe");
    const title = document.getElementById("modalTitle");
    const overview = document.getElementById("modalOverview");
    const tvControls = document.getElementById("tvControls");

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    title.innerText = "Loading stream...";
    overview.innerText = "Connecting to TMDB API & stream servers...";

    window.currentId = id;
    window.currentType = mediaType;
    window.currentServer = 1;

    let movie = await fetchStreamDetails(id, mediaType);
    if (!movie) {
        movie = currentCatalog.find(m => m.id == id) || FEATURED_MOVIES[0];
    }
    activeMovie = movie;
    window.currentImdb = movie.imdbId || movie.id;

    const year = document.getElementById("modalYear");
    const rating = document.getElementById("modalRating");
    const duration = document.getElementById("modalDuration");
    const director = document.getElementById("modalDirector");
    const cast = document.getElementById("modalCast");
    const genres = document.getElementById("modalGenres");
    const switcher = document.getElementById("serverSwitcher");

    title.innerText = movie.title;
    year.innerText = movie.year;
    rating.innerText = `★ ${movie.rating}`;
    duration.innerText = movie.duration;
    overview.innerText = movie.overview;
    director.innerText = movie.director || "Featured Director";
    cast.innerText = movie.cast ? movie.cast.join(", ") : "Lead Actor";
    genres.innerText = movie.genres ? movie.genres.join(" • ") : "Action";

    if (mediaType === "tv" || movie.type === "tv") {
        tvControls.style.display = "flex";
        tvControls.classList.remove("hidden");
        generateSeasonEpisodeDropdowns(movie.seasonsCount || 1);
        
        switcher.innerHTML = `
            <button class="server-btn active" onclick="loadServer(1, this)">Server 1 (vidsrc.pm)</button>
            <button class="server-btn" onclick="loadServer(2, this)">Server 2 (vidsrc.xyz)</button>
            <button class="server-btn" onclick="loadServer(3, this)">Server 3 (vidsrc.to)</button>
            <button class="server-btn" onclick="loadServer(4, this)">Server 4 (autoembed)</button>
        `;

        updateTvStream();
    } else {
        tvControls.style.display = "none";
        tvControls.classList.add("hidden");

        switcher.innerHTML = `
            <button class="server-btn active" onclick="loadServer(1, this)">Server 1 (vidsrc.pm)</button>
            <button class="server-btn" onclick="loadServer(2, this)">Server 2 (vidsrc.xyz)</button>
            <button class="server-btn" onclick="loadServer(3, this)">Server 3 (vidsrc.to)</button>
            <button class="server-btn" onclick="loadServer(4, this)">Server 4 (autoembed)</button>
        `;

        loadServer(1);
    }

    updateModalWatchlistBtn();
}

function loadServer(num, btnElement) {
    window.currentServer = num;
    const iframe = document.getElementById("playerIframe");
    if (!iframe) return;

    const imdb = window.currentImdb || "tt15239678";
    const tmdbId = window.currentId || "693134";

    if (window.currentType === "tv") {
        updateTvStream();
    } else {
        if (num === 1) {
            iframe.src = `https://vidsrc.pm/embed/movie/${imdb}`;
        } else if (num === 2) {
            iframe.src = `https://vidsrc.xyz/embed/movie/${imdb}`;
        } else if (num === 3) {
            iframe.src = `https://vidsrc.to/embed/movie/${tmdbId}`;
        } else {
            iframe.src = `https://autoembed.to/movie/tmdb/${tmdbId}`;
        }
    }

    if (btnElement) {
        const buttons = document.querySelectorAll(".server-btn");
        buttons.forEach(b => b.classList.remove("active"));
        btnElement.classList.add("active");
    }
}

// 1-Click Close Ad Overlay / Refresh Stream Cleanly
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
    const id = window.currentId || "1399";
    const sNum = window.currentServer || 1;

    if (sNum === 1) {
        iframe.src = `https://vidsrc.pm/embed/tv/${id}/${s}-${e}`;
    } else if (sNum === 2) {
        iframe.src = `https://vidsrc.xyz/embed/tv/${id}/${s}-${e}`;
    } else if (sNum === 3) {
        iframe.src = `https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
    } else {
        iframe.src = `https://autoembed.to/tv/tmdb/${id}-${s}-${e}`;
    }
}

function closePlayerModal() {
    const modal = document.getElementById("playerModal");
    const iframe = document.getElementById("playerIframe");
    if (iframe) iframe.src = "";
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "auto";
}

function handleModalWatchlistToggle() {
    if (!activeMovie) return;
    const added = toggleWatchlist(activeMovie);
    updateModalWatchlistBtn();
    updateWatchlistUI();
    showToast(added ? `Added "${activeMovie.title}" to Watchlist` : `Removed "${activeMovie.title}" from Watchlist`);
}

function updateModalWatchlistBtn() {
    const btn = document.getElementById("modalWatchlistBtn");
    if (!btn || !activeMovie) return;
    const inList = isInWatchlist(activeMovie.id);
    btn.innerText = inList ? "✓ Saved to Watchlist" : "+ Add to Watchlist";
    btn.style.background = inList ? "rgba(255, 42, 95, 0.2)" : "linear-gradient(135deg, var(--primary-neon), var(--primary-violet))";
}

function toggleWatchlistFromHero(id) {
    const movie = currentCatalog.find(m => m.id == id);
    if (!movie) return;
    const added = toggleWatchlist(movie);
    renderHeroSlider();
    updateWatchlistUI();
    showToast(added ? `Added "${movie.title}" to Watchlist` : `Removed "${movie.title}" from Watchlist`);
}

/* ---------------- Watchlist Drawer System ---------------- */
function toggleWatchlistDrawer() {
    const drawer = document.getElementById("drawerBackdrop");
    if (!drawer) return;
    drawer.classList.toggle("active");
    updateWatchlistUI();
}

function closeWatchlistDrawer() {
    const drawer = document.getElementById("drawerBackdrop");
    if (drawer) drawer.classList.remove("active");
}

function updateWatchlistUI() {
    const list = getWatchlist();
    const countBadge = document.getElementById("watchlistCount");
    const container = document.getElementById("watchlistContent");

    if (countBadge) countBadge.innerText = list.length;
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                <h3>Your Watchlist is Empty</h3>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Explore movies and click "+ Watchlist" to save them here for later.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(item => `
        <div class="watchlist-item">
            <img class="watchlist-thumb" src="${item.poster}" alt="${item.title}">
            <div class="watchlist-info">
                <div class="watchlist-title">${item.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${item.year} • ${item.quality || '4K'}</div>
                <button class="remove-btn" style="margin-top: 0.4rem;" onclick="removeWatchlistItem('${item.id}')">Remove</button>
            </div>
            <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="openPlayerModal('${item.id}', '${item.type || 'movie'}')">Play</button>
        </div>
    `).join('');
}

function removeWatchlistItem(id) {
    const list = getWatchlist();
    const item = list.find(m => m.id == id);
    if (item) {
        toggleWatchlist(item);
        updateWatchlistUI();
        showToast(`Removed "${item.title}" from Watchlist`);
    }
}

/* ---------------- In-App Social Profile Modal (@_beat_labs) ---------------- */
function openSocialModal() {
    const modal = document.getElementById("socialModal");
    if (modal) modal.classList.add("active");
}

function closeSocialModal() {
    const modal = document.getElementById("socialModal");
    if (modal) modal.classList.remove("active");
}

function copyInstagramHandle() {
    navigator.clipboard.writeText("@_beat_labs");
    showToast("Instagram handle @_beat_labs copied to clipboard!");
}

/* ---------------- FAQ Accordion ---------------- */
function toggleFaq(element) {
    element.classList.toggle("open");
}

/* ---------------- Notification Toasts ---------------- */
function showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-neon)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/* ---------------- Navigation & Scroll Utils ---------------- */
function scrollToSection(id) {
    const target = document.getElementById(id);
    if (target) {
        target.scrollIntoView({ behavior: "smooth" });
    }
}

function initScrollEffects() {
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closePlayerModal();
            closeSocialModal();
            closeWatchlistDrawer();
        }
    });
}
