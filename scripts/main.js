
const config = {
    initialRating: 0,
    targetRating: 1000,
    currentRating: 600
};

const progress = document.getElementById("progress");
const marker = document.getElementById("marker");
const rating = document.getElementById("rating");

document.getElementById("initial-rating").textContent = config.initialRating;
document.getElementById("target-rating").textContent = config.targetRating;

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

updateRating(config.currentRating);
