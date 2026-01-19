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

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);