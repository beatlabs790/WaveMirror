// WaveMirror Data Engine (Powered by OMDb API)

const OMDB_API_KEY = "a09b85fe"; // User OMDb API Key
const OMDB_BASE_URL = "https://www.omdbapi.com/";

// Curated backup database with verified IMDb IDs
const FEATURED_MOVIES = [
    {
        id: "tt15239678",
        imdbID: "tt15239678",
        title: "Dune: Part Two",
        type: "movie",
        poster: "https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGc@._V1_SX300.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s52SuTx.jpg",
        year: "2024",
        rating: "8.5",
        duration: "166 min",
        quality: "4K Ultra HD",
        genres: ["Action", "Adventure", "Sci-Fi"],
        overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        director: "Denis Villeneuve",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
        top10: 1,
        trending: true
    },
    {
        id: "tt15398776",
        imdbID: "tt15398776",
        title: "Oppenheimer",
        type: "movie",
        poster: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmItZTJmNzM1NWZlZGE4XkEyXkFqcGc@._V1_SX300.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/fm6K8OiXeEXHYD7yODk9kHfMTeJ.jpg",
        year: "2023",
        rating: "8.9",
        duration: "180 min",
        quality: "IMAX 4K",
        genres: ["Biography", "Drama", "History"],
        overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        director: "Christopher Nolan",
        cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
        top10: 2,
        trending: true
    },
    {
        id: "tt0848228",
        imdbID: "tt0848228",
        title: "The Avengers",
        type: "movie",
        poster: "https://m.media-amazon.com/images/M/MV5BNDYxNjQyMjAtNTdiOS00NGYwLWEyMDAtNjk5ZTEyMDJjMS1iXkEyXkFqcGc@._V1_SX300.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/mdfE15Y91d5uG7K1E6WpE.jpg",
        year: "2012",
        rating: "8.0",
        duration: "143 min",
        quality: "4K HDR",
        genres: ["Action", "Sci-Fi"],
        overview: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army.",
        director: "Joss Whedon",
        cast: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"],
        top10: 3,
        trending: true
    },
    {
        id: "tt9362722",
        imdbID: "tt9362722",
        title: "Spider-Man: Across the Spider-Verse",
        type: "movie",
        poster: "https://m.media-amazon.com/images/M/MV5BMzI0NmVkMjEtYmY4MS00ZDMxLTlkZmEtMzU4MDQxYTMzMjU2XkEyXkFqcGc@._V1_SX300.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/4XM8DUTQb3lhPpFGMD1p1L.jpg",
        year: "2023",
        rating: "8.7",
        duration: "140 min",
        quality: "4K HDR",
        genres: ["Animation", "Action", "Adventure"],
        overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
        director: "Joaquim Dos Santos",
        cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
        top10: 4,
        trending: true
    },
    {
        id: "tt0816692",
        imdbID: "tt0816692",
        title: "Interstellar",
        type: "movie",
        poster: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/pBRD98cSuWk2s3n.jpg",
        year: "2014",
        rating: "8.7",
        duration: "169 min",
        quality: "IMAX 4K",
        genres: ["Sci-Fi", "Drama", "Adventure"],
        overview: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
        director: "Christopher Nolan",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        top10: 5,
        trending: true
    }
];

// OMDb API Helper Functions
async function fetchLiveTrendingMovies() {
    try {
        const keywords = ["Avatar", "Dune", "Batman", "Spider-Man", "Oppenheimer", "Interstellar", "Avengers"];
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const res = await fetch(`${OMDB_BASE_URL}?s=${randomKeyword}&type=movie&apikey=${OMDB_API_KEY}`);
        if (!res.ok) throw new Error("OMDb response not ok");
        const data = await res.json();
        if (data.Search && data.Search.length > 0) {
            return parseOMDbSearchItems(data.Search, "movie");
        }
        return FEATURED_MOVIES;
    } catch (e) {
        console.warn("OMDb live fetch fallback:", e);
        return FEATURED_MOVIES;
    }
}

async function fetchLiveTrendingSeries() {
    try {
        const keywords = ["Game of Thrones", "Stranger Things", "Breaking Bad", "The Last of Us", "Loki"];
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const res = await fetch(`${OMDB_BASE_URL}?s=${randomKeyword}&type=series&apikey=${OMDB_API_KEY}`);
        if (!res.ok) throw new Error("OMDb series response not ok");
        const data = await res.json();
        if (data.Search && data.Search.length > 0) {
            return parseOMDbSearchItems(data.Search, "tv");
        }
        return [];
    } catch (e) {
        console.warn("OMDb TV fetch fallback:", e);
        return [];
    }
}

async function fetchLiveGenreMovies(genreName) {
    try {
        const res = await fetch(`${OMDB_BASE_URL}?s=${encodeURIComponent(genreName)}&type=movie&apikey=${OMDB_API_KEY}`);
        if (!res.ok) throw new Error("OMDb genre response not ok");
        const data = await res.json();
        if (data.Search && data.Search.length > 0) {
            return parseOMDbSearchItems(data.Search, "movie");
        }
        return FEATURED_MOVIES.filter(m => m.genres && m.genres.includes(genreName));
    } catch (e) {
        console.warn("OMDb genre fetch fallback:", e);
        return FEATURED_MOVIES;
    }
}

async function fetchLiveSearch(query) {
    try {
        const res = await fetch(`${OMDB_BASE_URL}?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
        if (!res.ok) throw new Error("OMDb search response not ok");
        const data = await res.json();
        if (data.Search && data.Search.length > 0) {
            return parseOMDbSearchItems(data.Search, "movie");
        }
        return [];
    } catch (e) {
        console.warn("OMDb search error:", e);
        return [];
    }
}

// Fetch Detailed Info by IMDb ID from OMDb API
async function fetchStreamDetails(imdbID, mediaType = "movie") {
    try {
        const res = await fetch(`${OMDB_BASE_URL}?i=${imdbID}&plot=full&apikey=${OMDB_API_KEY}`);
        if (!res.ok) throw new Error("OMDb detail error");
        const data = await res.json();
        if (data.Response === "False") throw new Error(data.Error);

        const posterUrl = (data.Poster && data.Poster !== "N/A") ? data.Poster : "https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGc@._V1_SX300.jpg";
        const genres = data.Genre ? data.Genre.split(", ") : ["Action"];

        return {
            id: data.imdbID,
            imdbID: data.imdbID,
            tmdbId: data.imdbID,
            title: data.Title,
            type: data.Type === "series" ? "tv" : mediaType,
            poster: posterUrl,
            backdrop: posterUrl,
            year: data.Year ? data.Year.substring(0, 4) : "2024",
            rating: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : "8.5",
            duration: data.Runtime && data.Runtime !== "N/A" ? data.Runtime : "2h 15m",
            seasonsCount: data.totalSeasons ? parseInt(data.totalSeasons) : 1,
            overview: data.Plot && data.Plot !== "N/A" ? data.Plot : "Stream this title exclusively on WaveMirror.",
            director: data.Director && data.Director !== "N/A" ? data.Director : "Featured Director",
            cast: data.Actors && data.Actors !== "N/A" ? data.Actors.split(", ") : ["Lead Actor"],
            genres
        };
    } catch (e) {
        console.warn("Error fetching stream details from OMDb:", e);
        const fallback = FEATURED_MOVIES.find(m => m.imdbID === imdbID || m.id === imdbID);
        return fallback || null;
    }
}

function parseOMDbSearchItems(items, defaultType = "movie") {
    return items.map((item, idx) => {
        const posterUrl = (item.Poster && item.Poster !== "N/A") ? item.Poster : "https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGc@._V1_SX300.jpg";
        const mediaType = item.Type === "series" ? "tv" : defaultType;
        return {
            id: item.imdbID,
            imdbID: item.imdbID,
            title: item.Title,
            type: mediaType,
            poster: posterUrl,
            backdrop: posterUrl,
            year: item.Year ? item.Year.substring(0, 4) : "2024",
            rating: "8.5",
            duration: mediaType === "tv" ? "TV Series" : "2h 15m",
            quality: "4K HDR",
            genres: ["Action", "Drama"],
            overview: `Stream ${item.Title} (${item.Year}) 100% free exclusively on WaveMirror.`,
            top10: idx < 10 ? idx + 1 : null,
            trending: true
        };
    });
}

// LocalStorage Watchlist Helper
const WATCHLIST_KEY = "wavemirror_watchlist_v2";

function getWatchlist() {
    try {
        const stored = localStorage.getItem(WATCHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error reading watchlist", e);
        return [];
    }
}

function saveWatchlist(list) {
    try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    } catch (e) {
        console.error("Error saving watchlist", e);
    }
}

function isInWatchlist(id) {
    const list = getWatchlist();
    return list.some(item => item.id == id || item.imdbID == id);
}

function toggleWatchlist(movie) {
    let list = getWatchlist();
    const index = list.findIndex(item => item.id == movie.id || item.imdbID == movie.imdbID);
    
    let added = false;
    if (index >= 0) {
        list.splice(index, 1);
    } else {
        list.unshift(movie);
        added = true;
    }
    saveWatchlist(list);
    return added;
}
