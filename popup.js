document.addEventListener('DOMContentLoaded', function() {
  const gameList = document.getElementById('game-list');
  const loading = document.getElementById('loading');
  const refreshBtn = document.getElementById('btn-refresh');
  const currencyBtn = document.getElementById('btn-currency');
  const refreshIcon = refreshBtn.querySelector('span');

  // Injection de styles CSS pour améliorer l'apparence
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --bg-body: #f5f5f5;
      --bg-card: #ffffff;
      --text-main: #333333;
      --text-title: #2c3e50;
      --text-muted: #757575;
      --border-color: #e0e0e0;
      --btn-bg: #f8f9fa;
      --btn-border: #ddd;
      --btn-hover: #e9ecef;
      --shadow: rgba(0,0,0,0.1);
      --shadow-hover: rgba(0,0,0,0.15);
      --scroll-track: #f1f1f1;
      --scroll-thumb: #ccc;
      --scroll-thumb-hover: #bbb;
    }
    body.dark-mode {
      --bg-body: #202124;
      --bg-card: #292a2d;
      --text-main: #e8eaed;
      --text-title: #e8eaed;
      --text-muted: #9aa0a6;
      --border-color: #5f6368;
      --btn-bg: #3c4043;
      --btn-border: #5f6368;
      --btn-hover: #4a4e51;
      --shadow: rgba(0,0,0,0.5);
      --shadow-hover: rgba(0,0,0,0.7);
      --scroll-track: #202124;
      --scroll-thumb: #5f6368;
      --scroll-thumb-hover: #757575;
    }
    body { font-family: 'Segoe UI', sans-serif; background-color: var(--bg-body); color: var(--text-main); min-width: 320px; transition: background-color 0.4s ease, color 0.4s ease; }
    #game-list { list-style: none; padding: 0; margin: 0; }
    .game-item { 
      background: var(--bg-card); border-radius: 8px; box-shadow: 0 2px 4px var(--shadow); 
      margin-bottom: 12px; overflow: hidden; transition: transform 0.2s, background-color 0.4s ease, box-shadow 0.4s ease; position: relative;
    }
    .game-item:hover { transform: translateY(-2px); box-shadow: 0 4px 8px var(--shadow-hover); }
    .game-image-container { height: 100px; overflow: hidden; position: relative; }
    .game-image { width: 100%; height: 100%; object-fit: cover; }
    .game-content { padding: 10px; }
    .game-title { 
      font-size: 14px; font-weight: bold; margin: 0 0 5px 0; 
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-title); transition: color 0.4s ease;
    }
    .game-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .game-price { 
      background-color: #e3f2fd; color: #1976d2; padding: 2px 6px; 
      border-radius: 4px; font-size: 12px; font-weight: 600; transition: background-color 0.4s ease, color 0.4s ease;
    }
    body.dark-mode .game-price { background-color: #1565c0; color: #e3f2fd; }
    .game-platform-badge {
      font-size: 10px; text-transform: uppercase; color: var(--text-muted); 
      border: 1px solid var(--border-color); padding: 1px 4px; border-radius: 3px; transition: color 0.4s ease, border-color 0.4s ease;
    }
    .btn-claim {
      display: block; text-align: center; background-color: #4caf50; color: white; 
      text-decoration: none; padding: 6px; border-radius: 4px; font-size: 13px; 
      font-weight: 500; transition: background-color 0.2s;
    }
    .btn-claim:hover { background-color: #43a047; }
    .game-item.seen { opacity: 0.6; }
    .game-item.seen .game-image { filter: grayscale(100%); }
    .game-item.seen::after {
      content: "VU"; position: absolute; top: 10px; right: 10px;
      background: rgba(0,0,0,0.6); color: white; padding: 2px 6px;
      border-radius: 4px; font-size: 10px; font-weight: bold; pointer-events: none;
    }
    /* Style pour le select existant */
    select { 
      padding: 8px; border: 1px solid var(--btn-border); border-radius: 6px; 
      outline: none; background: var(--bg-card); color: var(--text-main); font-size: 13px; cursor: pointer;
      box-shadow: 0 1px 2px var(--shadow); transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
    }
    /* Scrollbar personnalisée */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--scroll-track); }
    ::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--scroll-thumb-hover); }

    /* Styles pour le menu Paramètres */
    .settings-view { display: none; padding: 5px 0; }
    .settings-item { background: var(--bg-card); padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px var(--shadow); transition: background-color 0.4s ease, box-shadow 0.4s ease; }
    .settings-label { font-weight: 600; color: var(--text-main); font-size: 13px; transition: color 0.4s ease; }
    
    /* Boutons d'action (ON/OFF) améliorés */
    .btn-action { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--btn-border); background: var(--btn-bg); color: var(--text-main); cursor: pointer; font-size: 13px; min-width: 60px; font-weight: 600; transition: all 0.3s ease; }
    .btn-action:hover { background: var(--btn-hover); }
    .btn-action.active { background-color: #4caf50; color: white; border-color: #4caf50; box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3); }
    .btn-action.active:hover { background-color: #43a047; }

    .btn-danger { color: #dc3545; border-color: #ffcdd2; background: var(--bg-card); transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease; }
    body.dark-mode .btn-danger { color: #ff6b6b; border-color: #e57373; background: var(--bg-card); }
    .btn-danger:hover { background: #dc3545; color: white; border-color: #dc3545; }
    .btn-back { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; margin-bottom: 15px; display: flex; align-items: center; padding: 5px 0; font-weight: 600; transition: color 0.4s ease; }
    .btn-back:hover { color: var(--text-main); }

    /* Boutons d'en-tête (Reload et Paramètres) */
    #btn-refresh, #btn-currency {
      background-color: var(--btn-bg); color: var(--text-main); border: 1px solid var(--btn-border);
      border-radius: 4px; cursor: pointer; transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease;
    }
    #btn-refresh:hover, #btn-currency:hover { background-color: var(--btn-hover); }
  `;
  document.head.appendChild(style);

  // Création dynamique du menu de filtre
  let platformFilter = 'all';
  const filterSelect = document.createElement('select');
  // On retire le style inline pour utiliser le CSS injecté, sauf pour la marge
  filterSelect.style.cssText = 'margin: 0 0 15px 0; width: 100%;';
  
  const options = [
    { val: 'all', text: 'Toutes les plateformes' },
    { val: 'steam', text: 'Steam' },
    { val: 'epic', text: 'Epic Games' },
    { val: 'not_seen', text: 'Non vus uniquement' }
  ];
  options.forEach(opt => {
    const el = document.createElement('option');
    el.value = opt.val;
    el.textContent = opt.text;
    filterSelect.appendChild(el);
  });
  // Insertion du filtre avant la liste des jeux
  if (gameList && gameList.parentNode) {
    gameList.parentNode.insertBefore(filterSelect, gameList);
  }

  filterSelect.addEventListener('change', (e) => {
    platformFilter = e.target.value;
    chrome.storage.local.set({ filter_preference: platformFilter });
    loadGames(false); // Rechargement de l'affichage
  });

  // GESTION DU MENU PARAMÈTRES

  // Transformation du bouton devise en bouton paramètres
  const settingsBtn = currencyBtn.cloneNode(true);
  currencyBtn.parentNode.replaceChild(settingsBtn, currencyBtn);
  settingsBtn.textContent = '⚙️';
  settingsBtn.style.fontSize = '16px';
  settingsBtn.title = "Paramètres";

  // Création de la vue Paramètres
  const settingsView = document.createElement('div');
  settingsView.className = 'settings-view';
  settingsView.innerHTML = `
    <button class="btn-back">← Retour</button>
    <div class="settings-item">
      <span class="settings-label">Devise</span>
      <button id="setting-currency-toggle" class="btn-action">USD</button>
    </div>
    <div class="settings-item">
      <span class="settings-label">Mode Sombre</span>
      <button id="setting-dark-toggle" class="btn-action">OFF</button>
    </div>
    <div class="settings-item">
      <span class="settings-label">Notifications</span>
      <button id="setting-notif-toggle" class="btn-action">ON</button>
    </div>
    <div class="settings-item">
      <span class="settings-label">Historique</span>
      <button id="setting-reset-seen" class="btn-action btn-danger">Réinitialiser "Vus"</button>
    </div>
  `;
  gameList.parentNode.appendChild(settingsView);

  const settingCurrencyBtn = settingsView.querySelector('#setting-currency-toggle');
  const settingDarkBtn = settingsView.querySelector('#setting-dark-toggle');
  const settingNotifBtn = settingsView.querySelector('#setting-notif-toggle');
  const settingResetBtn = settingsView.querySelector('#setting-reset-seen');
  const backBtn = settingsView.querySelector('.btn-back');

  // Navigation
  settingsBtn.addEventListener('click', () => {
    gameList.style.display = 'none';
    filterSelect.style.display = 'none';
    settingsView.style.display = 'block';
    settingsBtn.style.visibility = 'hidden'; // Cache le bouton engrenage
    refreshBtn.style.visibility = 'hidden';
  });

  backBtn.addEventListener('click', () => {
    settingsView.style.display = 'none';
    gameList.style.display = 'block';
    filterSelect.style.display = 'block';
    settingsBtn.style.visibility = 'visible';
    refreshBtn.style.visibility = 'visible';
    loadGames(false); // Rafraîchir pour appliquer les changements
  });

  // Action: Réinitialiser les vus
  settingResetBtn.addEventListener('click', () => {
    chrome.storage.local.remove('seen_games', () => {
      settingResetBtn.textContent = 'Effectué !';
      setTimeout(() => settingResetBtn.textContent = 'Réinitialiser "Vus"', 1500);
    });
  });

  // Action: Toggle Notifications
  // Chargement état initial
  chrome.storage.local.get(['notifications_enabled'], (res) => {
    const enabled = res.notifications_enabled !== false; // true par défaut
    settingNotifBtn.textContent = enabled ? 'ON' : 'OFF';
    if (enabled) settingNotifBtn.classList.add('active');
  });

  settingNotifBtn.addEventListener('click', () => {
    chrome.storage.local.get(['notifications_enabled'], (res) => {
      const newState = !(res.notifications_enabled !== false);
      chrome.storage.local.set({ notifications_enabled: newState });
      settingNotifBtn.textContent = newState ? 'ON' : 'OFF';
      settingNotifBtn.classList.toggle('active', newState);
    });
  });

  // Action: Toggle Dark Mode
  function applyDarkMode(isDark) {
    if (isDark) {
      document.body.classList.add('dark-mode');
      settingDarkBtn.textContent = 'ON';
      settingDarkBtn.classList.add('active');
    } else {
      document.body.classList.remove('dark-mode');
      settingDarkBtn.textContent = 'OFF';
      settingDarkBtn.classList.remove('active');
    }
  }

  chrome.storage.local.get(['dark_mode'], (res) => {
    if (res.dark_mode) applyDarkMode(true);
  });

  settingDarkBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const newState = !isDark;
    applyDarkMode(newState);
    chrome.storage.local.set({ dark_mode: newState });
  });

  // Clé de stockage et durée du cache (1 heure en ms)
  const CACHE_KEY = 'steam_free_games_cache';
  const EPIC_CACHE_KEY = 'epic_games_cache';
  const SEEN_GAMES_KEY = 'seen_games';
  const CACHE_DURATION = 3600 * 1000;
  const RATE_USD_EUR = 0.92; // Taux de conversion approximatif

  // Fonction pour afficher la liste des jeux
  function displayGames(games, currency, platform, seenGames = []) {
    loading.style.display = 'none';

    // Filtrage si l'option "Non vus uniquement" est sélectionnée
    let gamesToDisplay = games || [];
    if (platformFilter === 'not_seen') {
      gamesToDisplay = gamesToDisplay.filter(g => !seenGames.includes(g.id));
    }

    if (!gamesToDisplay || gamesToDisplay.length === 0) {
      if (platformFilter !== 'not_seen') {
        const noGamesMessage = `<li>Aucun jeu gratuit sur ${platform} en ce moment.</li>`;
        gameList.innerHTML += noGamesMessage;
      }
      return;
    }

    gamesToDisplay.forEach(game => {
      const isSeen = seenGames.includes(game.id);
      const li = document.createElement('li');
      li.className = 'game-item' + (isSeen ? ' seen' : '');
      
      // Formatage du prix selon la devise
      let displayPrice = game.worth;
      const priceVal = parseFloat(game.worth.replace(/[^0-9.]/g, ''));
      if (!isNaN(priceVal) && currency === 'EUR') {
        displayPrice = (priceVal * RATE_USD_EUR).toFixed(2) + '€';
      }

      // Nouveau format "Carte" avec image
      li.innerHTML = `
        <div class="game-image-container">
          <img src="${game.image}" alt="${game.title}" class="game-image" onerror="this.style.display='none'">
        </div>
        <div class="game-content">
          <div class="game-title" title="${game.title}">${game.title}</div>
          <div class="game-meta">
            <span class="game-platform-badge">${platform}</span>
            <span class="game-price">Valeur: ${displayPrice}</span>
          </div>
          <a href="${game.open_giveaway_url}" target="_blank" class="btn-claim">Obtenir Gratuitement</a>
        </div>
      `;
      gameList.appendChild(li);

      // Gestion du clic pour marquer comme vu
      const btn = li.querySelector('.btn-claim');
      if (btn) {
        btn.addEventListener('click', () => {
          li.classList.add('seen');
          chrome.storage.local.get([SEEN_GAMES_KEY], (res) => {
            const list = res[SEEN_GAMES_KEY] || [];
            if (!list.includes(game.id)) {
              list.push(game.id);
              chrome.storage.local.set({ [SEEN_GAMES_KEY]: list });
            }
          });
        });
      }
    });
  }

  // Fonction principale de chargement
  function loadGames(forceRefresh = false) {
    chrome.storage.local.get([CACHE_KEY, EPIC_CACHE_KEY, 'currency', SEEN_GAMES_KEY], function(result) {
      const steamCache = result[CACHE_KEY];
      const epicCache = result[EPIC_CACHE_KEY];
      const currency = result.currency || 'USD';
      const seenGames = result[SEEN_GAMES_KEY] || [];
      const now = Date.now();

      // Mise à jour du bouton devise dans les paramètres
      if (settingCurrencyBtn) settingCurrencyBtn.textContent = currency;

      const steamGames = steamCache && (now - steamCache.timestamp < CACHE_DURATION) ? steamCache.data : [];
      const epicGames = epicCache && (now - epicCache.timestamp < CACHE_DURATION) ? epicCache.data : [];

      // On vide la liste pour éviter les doublons (notamment au changement de devise)
      gameList.innerHTML = '';

      // Si pas de force refresh et cache valide
      if (!forceRefresh && steamGames.length > 0 && epicGames.length > 0) {
        if (platformFilter === 'all' || platformFilter === 'steam' || platformFilter === 'not_seen') displayGames(steamGames, currency, 'Steam', seenGames);
        if (platformFilter === 'all' || platformFilter === 'epic' || platformFilter === 'not_seen') displayGames(epicGames, currency, 'Epic Games', seenGames);
      } else {
        loading.style.display = 'block';
        if (refreshIcon) refreshIcon.classList.add('spinning');

        // Sinon, on appelle l'API (Steam et Epic Games)
        const steamApiUrl = 'https://www.gamerpower.com/api/giveaways?platform=steam&type=game&sort-by=value';
        const epicApiUrl = 'https://www.gamerpower.com/api/giveaways?platform=epic-games-store&type=game&sort-by=value';

        Promise.all([
          fetch(steamApiUrl).then(response => response.json()).catch(() => []),
          fetch(epicApiUrl).then(response => response.json()).catch(() => [])
        ]).then(([steamData, epicData]) => {
          const steamGames = Array.isArray(steamData) ? steamData : [];
          const epicGames = Array.isArray(epicData) ? epicData : [];

          // Mise à jour du cache
          chrome.storage.local.set({
            [CACHE_KEY]: { timestamp: now, data: steamGames },
            [EPIC_CACHE_KEY]: { timestamp: now, data: epicGames }
          });

          if (platformFilter === 'all' || platformFilter === 'steam' || platformFilter === 'not_seen') displayGames(steamGames, currency, 'Steam', seenGames);
          if (platformFilter === 'all' || platformFilter === 'epic' || platformFilter === 'not_seen') displayGames(epicGames, currency, 'Epic Games', seenGames);
        }).catch(error => {
          loading.innerText = "Erreur de connexion.";
          console.error(error);
        }).finally(() => {
          if (refreshIcon) refreshIcon.classList.remove('spinning');
          loading.style.display = 'none';
        });
      }
    });
  }

  // Événements des boutons
  refreshBtn.addEventListener('click', () => loadGames(true));

  // Action: Changer de devise (dans le menu)
  settingCurrencyBtn.addEventListener('click', () => {
    chrome.storage.local.get(['currency'], (result) => {
      const current = result.currency || 'USD';
      const next = current === 'USD' ? 'EUR' : 'USD';
      chrome.storage.local.set({ currency: next }, () => {
        settingCurrencyBtn.textContent = next;
      });
    });
  });

  // Chargement initial
  chrome.storage.local.get(['filter_preference'], (result) => {
    if (result.filter_preference) {
      platformFilter = result.filter_preference;
      filterSelect.value = platformFilter;
    }
    loadGames();
  });
});