document.addEventListener('DOMContentLoaded', function() {
  const gameList = document.getElementById('game-list');
  const loading = document.getElementById('loading');
  const refreshBtn = document.getElementById('btn-refresh');
  const currencyBtn = document.getElementById('btn-currency');
  const refreshIcon = refreshBtn.querySelector('span');

  // Clé de stockage et durée du cache (1 heure en millisecondes)
  const CACHE_KEY = 'steam_free_games_cache';
  const CACHE_DURATION = 3600 * 1000;
  const RATE_USD_EUR = 0.92; // Taux de conversion approximatif

  // Fonction pour afficher la liste des jeux
  function displayGames(games, currency) {
    loading.style.display = 'none';
    gameList.innerHTML = '';

    // Calcul de la valeur totale pour la couleur
    let totalValue = 0;
    if (games) {
      games.forEach(game => {
        const price = parseFloat(game.worth.replace(/[^0-9.]/g, ''));
        if (!isNaN(price)) {
          // Conversion si nécessaire
          if (currency === 'EUR') totalValue += price * RATE_USD_EUR;
          else totalValue += price;
        }
      });
    }

    let color = '#28a745'; // Vert
    if (totalValue >= 50) color = '#dc3545';      // Rouge
    else if (totalValue >= 30) color = '#007bff'; // Bleu
    else if (totalValue >= 10) color = '#17a2b8'; // Cyan

    // Mise à jour du badge (pastille)
    const count = games ? games.length : 0;
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: color });

    if (!games || games.length === 0) {
      gameList.innerHTML = '<li>Aucun jeu gratuit sur Steam en ce moment.</li>';
      return;
    }

    games.forEach(game => {
      const li = document.createElement('li');
      li.className = 'game-item';
      
      // Formatage du prix selon la devise
      let displayPrice = game.worth;
      const priceVal = parseFloat(game.worth.replace(/[^0-9.]/g, ''));
      if (!isNaN(priceVal) && currency === 'EUR') {
        displayPrice = (priceVal * RATE_USD_EUR).toFixed(2) + '€';
      }

      // Format texte simple avec titre, valeur et lien
      li.innerHTML = `
        <div><strong>${game.title}</strong></div>
        <div style="font-size: 0.85em; color: #555;">Valeur: ${displayPrice}</div>
        <div style="margin-top:4px;">
          <a href="${game.open_giveaway_url}" target="_blank" class="link">Lien Steam →</a>
        </div>
        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
      `;
      gameList.appendChild(li);
    });
  }

  // Fonction principale de chargement
  function loadGames(forceRefresh = false) {
    chrome.storage.local.get([CACHE_KEY, 'currency'], function(result) {
      const cached = result[CACHE_KEY];
      const currency = result.currency || 'USD';
      const now = Date.now();
      
      // Mise à jour du texte du bouton devise
      if (currencyBtn) currencyBtn.textContent = currency;

      // Si pas de force refresh et cache valide
      if (!forceRefresh && cached && (now - cached.timestamp < CACHE_DURATION)) {
        displayGames(cached.data, currency);
      } else {
        loading.style.display = 'block';
        gameList.innerHTML = '';
        if (refreshIcon) refreshIcon.classList.add('spinning');

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
            
            displayGames(games, currency);
            if (refreshIcon) refreshIcon.classList.remove('spinning');
          })
          .catch(error => {
            loading.innerText = "Erreur de connexion.";
            console.error(error);
            if (refreshIcon) refreshIcon.classList.remove('spinning');
          });
      }
    });
  }

  // Événements des boutons
  refreshBtn.addEventListener('click', () => loadGames(true));

  currencyBtn.addEventListener('click', () => {
    chrome.storage.local.get(['currency'], (result) => {
      const current = result.currency || 'USD';
      const next = current === 'USD' ? 'EUR' : 'USD';
      chrome.storage.local.set({ currency: next }, () => {
        loadGames(false); // Rechargement avec la nouvelle devise (utilise le cache si dispo)
      });
    });
  });

  // Chargement initial
  loadGames();
});