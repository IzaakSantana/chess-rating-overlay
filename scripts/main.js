const config = {
    username: "Isaac_S_S",
    gameMode: "chess_bullet",
    initialRating: 0,
    targetRating: 1000,
    currentRating: 600,
    updateInterval: 30000
};

const progress = document.getElementById("progress");
const marker = document.getElementById("marker");
const rating = document.getElementById("rating");

document.getElementById("initial-rating").textContent = config.initialRating;
document.getElementById("target-rating").textContent = config.targetRating;

document.addEventListener("keydown", (event) => {
    if (event.key === "F8") {
        event.preventDefault();

        const input = prompt(
            "Novo rating:",
            config.currentRating
        );

        if (input === null || input.trim() === "") return;

        const value = Number(input);

        if (Number.isInteger(value) && value >= 0) {
            updateRating(value);
        }
    }
});

function updateRating(value) {
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

updateRating(config.currentRating);

fetchRating();
