// Sauvegarde les options
function saveOptions() {
  const currency = document.getElementById('currency').value;
  chrome.storage.local.set({ currency: currency }, function() {
    const status = document.getElementById('status');
    status.textContent = 'Options sauvegardées.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

// Restaure les options
function restoreOptions() {
  chrome.storage.local.get({ currency: 'USD' }, function(items) {
    document.getElementById('currency').value = items.currency;
  });
}

function resetSeenGames() {
  chrome.storage.local.remove('seen_games', function() {
    const status = document.getElementById('status');
    status.textContent = 'Historique des jeux vus effacé.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restoreOptions();

  // Ajout dynamique du bouton de réinitialisation à côté du bouton Sauvegarder
  const saveBtn = document.getElementById('save');
  if (saveBtn) {
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Réinitialiser les jeux "Vus"';
    resetBtn.style.marginLeft = '10px';
    resetBtn.addEventListener('click', resetSeenGames);
    saveBtn.parentNode.insertBefore(resetBtn, saveBtn.nextSibling);
  }
});
document.getElementById('save').addEventListener('click', saveOptions);