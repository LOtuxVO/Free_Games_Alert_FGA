document.addEventListener('DOMContentLoaded', function() {
  const gameList = document.getElementById('game-list');
  const loading = document.getElementById('loading');

  // Clé de stockage et durée du cache (1 heure en millisecondes)
  const CACHE_KEY = 'steam_free_games_cache';
  const CACHE_DURATION = 3600 * 1000;

  // Fonction pour afficher la liste des jeux
  function displayGames(games) {
    loading.style.display = 'none';
    gameList.innerHTML = '';

    if (!games || games.length === 0) {
      gameList.innerHTML = '<li>Aucun jeu gratuit sur Steam en ce moment.</li>';
      return;
    }

    games.forEach(game => {
      const li = document.createElement('li');
      li.className = 'game-item';
      // Format texte simple avec titre, valeur et lien
      li.innerHTML = `
        <div><strong>${game.title}</strong></div>
        <div style="font-size: 0.85em; color: #555;">Valeur: ${game.worth}</div>
        <div style="margin-top:4px;">
          <a href="${game.open_giveaway_url}" target="_blank" class="link">Lien Steam →</a>
        </div>
        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
      `;
      gameList.appendChild(li);
    });
  }

  // Vérification du cache au chargement
  chrome.storage.local.get([CACHE_KEY], function(result) {
    const cached = result[CACHE_KEY];
    const now = Date.now();

    // Si le cache existe et a moins d'une heure
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      displayGames(cached.data);
    } else {
      // Sinon, on appelle l'API (Steam uniquement)
      const apiUrl = 'https://www.gamerpower.com/api/giveaways?platform=steam&type=game&sort-by=value';

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          // On s'assure que c'est un tableau
          const games = Array.isArray(data) ? data : [];
          
          // Mise à jour du cache
          chrome.storage.local.set({
            [CACHE_KEY]: {
              timestamp: now,
              data: games
            }
          });
          
          displayGames(games);
        })
        .catch(error => {
          loading.innerText = "Erreur de connexion.";
          console.error(error);
        });
    }
  });
});