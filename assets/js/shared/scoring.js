// scoring.js - unified scoring API
const Scoring = {
  saveHighScore: function(gameId, name, score) {
    const key = 'highscores_' + gameId;
    const list = Storage.load(key, []);
    list.push({ name: name || 'ANON', score: score, date: Date.now() });
    list.sort((a, b) => b.score - a.score);
    Storage.save(key, list.slice(0, 10));
  },
  getHighScores: function(gameId) {
    return Storage.load('highscores_' + gameId, []);
  }
};
