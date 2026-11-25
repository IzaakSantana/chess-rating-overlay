const config = {
    username: "Isaac_S_S",
    gameMode: "chess_rapid",
    initialRating: 0,
    targetRating: 1000,
    currentRating: 600,
    updateInterval: 30000
};

const progress = document.getElementById("progress");
const marker = document.getElementById("marker");
const rating = document.getElementById("rating");

let lastUpdate = Date.now();

document.getElementById("initial-rating").textContent = config.initialRating;
document.getElementById("target-rating").textContent = config.targetRating;


function updateRating(value) {
    console.log(
        "Rating anterior:", config.currentRating,
        "Novo rating:", value
    );

    console.trace();

    config.currentRating = value;

    const percentage = Math.max(0, Math.min(100,
        (value - config.initialRating) /
        (config.targetRating - config.initialRating) * 100
    ));

    progress.style.width = `${percentage}%`;
    marker.style.left = `${percentage}%`;
    rating.textContent = value;
}

async function fetchRating() {
    const url = `https://api.chess.com/pub/player/${config.username.toLowerCase()}/stats`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const newRating = data[config.gameMode]?.last?.rating;

        if (typeof newRating !== "number") {
            throw new Error("Rating não encontrado");
        }

        if (newRating !== config.currentRating) {
            updateRating(newRating);
        }

    } catch (error) {
        console.error("Erro ao consultar rating: ", error);
    }
}

async function fetchLocalRating() {
    try {
        const response = await fetch("./data/rating.json", {
            cache: "no-store"
        });

        if (!response.ok) return;

        const data = await response.json();

        if (
            Number.isInteger(data.rating) &&
            data.rating >= 0 &&
            data.timestamp > lastUpdate
        ) {
            lastUpdate = data.timestamp;
            updateRating(data.rating);
        }

    } catch (error) {
        console.error("Erro ao consultar rating local:", error);
    }
}

async function init() {
    updateRating(config.currentRating);

    await fetchRating();

    setInterval(fetchLocalRating, 500);
}

init();
