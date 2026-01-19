const CACHE_KEY = 'steam_free_games_cache';
const RATE_USD_EUR = 0.92;

function updateBadge() {
  const apiUrl = 'https://www.gamerpower.com/api/giveaways?platform=steam&type=game&sort-by=value';

  // Récupération de la devise pour le calcul
  chrome.storage.local.get(['currency'], function(result) {
    const currency = result.currency || 'USD';
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
      const games = Array.isArray(data) ? data : [];
      const count = games.length;

      // Calcul de la valeur totale des jeux
      let totalValue = 0;
      games.forEach(game => {
        // Nettoyage du prix (ex: "$19.99" -> 19.99)
        const price = parseFloat(game.worth.replace(/[^0-9.]/g, ''));
        if (!isNaN(price)) {
          if (currency === 'EUR') totalValue += price * RATE_USD_EUR;
          else totalValue += price;
        }
      });

      // Détermination de la couleur selon les paliers (Vert -> Cyan -> Bleu -> Rouge)
      let color = '#28a745'; // Vert (< 10)
      if (totalValue >= 50) color = '#dc3545';      // Rouge (> 50)
      else if (totalValue >= 30) color = '#007bff'; // Bleu (30-50)
      else if (totalValue >= 10) color = '#17a2b8'; // Cyan (10-30)

      // Mise à jour du texte et de la couleur du badge
      // Si count > 0 on affiche le nombre, sinon on n'affiche rien
      chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
      chrome.action.setBadgeBackgroundColor({ color: color });

      // Mise à jour du cache pour que la popup s'ouvre instantanément
      chrome.storage.local.set({
        [CACHE_KEY]: {
          timestamp: Date.now(),
          data: games
        }
      });
    })
    .catch(error => console.error("Erreur background:", error));
  });
}

// Vérification à l'installation ou au rechargement de l'extension
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
  // Création d'une alarme pour vérifier toutes les 60 minutes
  chrome.alarms.create('checkGamesAlarm', { periodInMinutes: 60 });
});

// Vérification périodique via l'alarme
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkGamesAlarm') {
    updateBadge();
  }
});
