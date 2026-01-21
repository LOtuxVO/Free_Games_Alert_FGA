const CACHE_KEY = 'steam_free_games_cache';
const EPIC_CACHE_KEY = 'epic_games_cache';
const SEEN_GAMES_KEY = 'seen_games';
const RATE_USD_EUR = 0.92;

// Fonction pour recalculer le badge à partir du cache (sans appel API)
// Cette fonction est appelée dès que les données changent (via popup ou background)
function updateBadgeFromCache() {
  chrome.storage.local.get([CACHE_KEY, EPIC_CACHE_KEY, SEEN_GAMES_KEY, 'currency', 'notifications_enabled', 'last_unseen_count'], (result) => {
    const steamGames = result[CACHE_KEY]?.data || [];
    const epicGames = result[EPIC_CACHE_KEY]?.data || [];
    const seenGames = result[SEEN_GAMES_KEY] || [];
    const currency = result.currency || 'USD';
    const notificationsEnabled = result.notifications_enabled !== false; // Activé par défaut
    const lastCount = result.last_unseen_count;

    // On combine tous les jeux
    const allGames = [...steamGames, ...epicGames];
    
    // On filtre ceux qui sont déjà vus
    const unseenGames = allGames.filter(g => !seenGames.includes(g.id));
    const count = unseenGames.length;

    // Calcul de la valeur totale des jeux NON vus
    let totalValue = 0;
    unseenGames.forEach(game => {
      const price = parseFloat(game.worth.replace(/[^0-9.]/g, ''));
      if (!isNaN(price)) {
        if (currency === 'EUR') totalValue += price * RATE_USD_EUR;
        else totalValue += price;
      }
    });

    // Détermination de la couleur
    let color = '#28a745'; // Vert
    if (totalValue >= 50) color = '#dc3545';      // Rouge
    else if (totalValue >= 30) color = '#007bff'; // Bleu
    else if (totalValue >= 10) color = '#17a2b8'; // Cyan

    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: color });

    // Gestion de la notification
    // Si activé, qu'on a un historique (pas premier lancement), et qu'il y a plus de jeux qu'avant
    if (notificationsEnabled && typeof lastCount === 'number' && count > lastCount) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Nouveaux jeux gratuits !',
        message: `${count} jeux sont disponibles (dont ${count - lastCount} nouveaux).`,
        priority: 1
      });
    }

    // Mise à jour du compteur pour la prochaine comparaison
    if (count !== lastCount) {
      chrome.storage.local.set({ 'last_unseen_count': count });
    }
  });
}

// Fonction pour récupérer les nouvelles données API (Background périodique)
function checkNewGames() {
  const steamUrl = 'https://www.gamerpower.com/api/giveaways?platform=steam&type=game&sort-by=value';
  const epicUrl = 'https://www.gamerpower.com/api/giveaways?platform=epic-games-store&type=game&sort-by=value';

  Promise.all([
    fetch(steamUrl).then(r => r.json()).catch(() => []),
    fetch(epicUrl).then(r => r.json()).catch(() => [])
  ]).then(([steamData, epicData]) => {
    const steamGames = Array.isArray(steamData) ? steamData : [];
    const epicGames = Array.isArray(epicData) ? epicData : [];

    // Sauvegarde dans le cache -> déclenchera onChanged -> updateBadgeFromCache
    chrome.storage.local.set({
      [CACHE_KEY]: { timestamp: Date.now(), data: steamGames },
      [EPIC_CACHE_KEY]: { timestamp: Date.now(), data: epicGames }
    });
  }).catch(console.error);
}

chrome.runtime.onInstalled.addListener(() => {
  checkNewGames();
  chrome.alarms.create('checkGamesAlarm', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkGamesAlarm') {
    checkNewGames();
  }
});

// Réagit aux changements de cache (venant du background ou de la popup) ou de statut "vu"
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // On ignore les changements de 'last_unseen_count' pour éviter une boucle (car updateBadgeFromCache le modifie)
    if (changes['last_unseen_count'] && Object.keys(changes).length === 1) return;

    if (changes[CACHE_KEY] || changes[EPIC_CACHE_KEY] || changes[SEEN_GAMES_KEY] || changes['currency'] || changes['notifications_enabled']) {
      updateBadgeFromCache();
    }
  }
});
