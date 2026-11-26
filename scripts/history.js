const config = {
    username: "Isaac_S_S",
    gameMode: "rapid",
    seriesStart: new Date("2026-11-25T00:00:00-03:00"),
    updateInterval: 60000
};

let fetching = false;

function getArchiveUrls() {
    const urls = [];
    const start = config.seriesStart;
    const now = new Date();

    const date = new Date(Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        1
    ));

    const username = config.username.toLowerCase();

    while (date <= now) {
        const year = date.getUTCFullYear();

        const month = String(
            date.getUTCMonth() + 1
        ).padStart(2, "0");

        urls.push(
            `https://api.chess.com/pub/player/${username}/games/${year}/${month}`
        );

        date.setUTCMonth(date.getUTCMonth() + 1);
    }

    return urls;
}

function calculateStats(games) {
    const stats = {
        wins: 0,
        losses: 0,
        draws: 0
    };

    const drawResults = [
        "agreed",
        "repetition",
        "stalemate",
        "insufficient",
        "50move",
        "timevsinsufficient"
    ];

    const lossResults = [
        "checkmated",
        "resigned",
        "timeout",
        "abandoned",
        "lose"
    ];

    const username = config.username.toLowerCase();

    for (const game of games) {
        if (game.time_class !== config.gameMode) continue;
        if (game.rules !== "chess") continue;
        if (!game.rated) continue;

        if (game.end_time * 1000 < config.seriesStart.getTime()) {
            continue;
        }

        const player = [game.white, game.black].find(
            p => p.username.toLowerCase() === username
        );

        if (!player) continue;

        if (player.result === "win") {
            stats.wins++;
        } else if (drawResults.includes(player.result)) {
            stats.draws++;
        } else if (lossResults.includes(player.result)) {
            stats.losses++;
        }
    }

    return stats;
}

function updateHistory(stats) {
    const { wins, losses, draws } = stats;
    const total = wins + losses + draws;

    const percentage = value =>
        total > 0 ? value / total * 100 : 0;

    document.getElementById("wins").textContent = wins;
    document.getElementById("losses").textContent = losses;
    document.getElementById("draws").textContent = draws;

    document.getElementById("wins-bar").style.width =
        `${percentage(wins)}%`;

    document.getElementById("losses-bar").style.width =
        `${percentage(losses)}%`;

    document.getElementById("draws-bar").style.width =
        `${percentage(draws)}%`;

    document.getElementById("total").textContent =
        `${total} partidas`;

    document.getElementById("winrate").textContent =
        `${percentage(wins).toFixed(1).replace(".", ",")}% de winrate`;
}



async function fetchHistory() {
    if (fetching) return;

    fetching = true;

    try {
        const urls = getArchiveUrls();
        const games = [];

        for (const url of urls) {
            const response = await fetch(url, {
                cache: "no-store"
            });

            if (response.status === 404) continue;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            games.push(...data.games);
        }

        const stats = calculateStats(games);

        console.log("Partidas encontradas:", games.length);
        console.log("Estatísticas:", stats);

        updateHistory(stats);

    } catch (error) {
        console.error("Erro ao consultar histórico:", error);
    } finally {
        fetching = false;
    }
}

fetchHistory();

setInterval(fetchHistory, config.updateInterval);