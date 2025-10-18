const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do what you can, with what you have, where you are.", category: "Inspiration" }
];


function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}

// script.js

// 1. Application state
let quote = []; // array of objects: { text: '', category: '' }
const LOCAL_STORAGE_KEY = 'quotes_app_quotes';

// 2. Query DOM elements
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quotesList = document.getElementById('quotesList');
const importFile = document.getElementById('importFile');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const lastViewed = document.getElementById('lastViewed');

// 3. Load saved quotes from localStorage on page load
function loadQuotes() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored quotes', e);
      quotes = [];
    }
  } else {
    // optionally prefill with sample quotes (comment out if you don't want)
    quotes = [
      { text: 'Be the change you want to see.', category: 'motivation' },
      { text: 'Simplicity is the ultimate sophistication.', category: 'design' }
    ];
    saveQuotes(); // persist initial set
  }
}

// 4. Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// 5. Render quotes to the page
function renderQuotes() {
  quotesList.innerHTML = '';
  quotes.forEach((q, index) => {
    const li = document.createElement('li');

    // quote text + category
    const textSpan = document.createElement('span');
    textSpan.textContent = `"${q.text}" (${q.category || 'uncategorized'})`;
    textSpan.style.cursor = 'pointer';

    // view button (stores last viewed quote in sessionStorage)
    textSpan.addEventListener('click', () => {
      sessionStorage.setItem('lastViewedQuote', JSON.stringify(q));
      updateLastViewed();
    });

    // delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.style.marginLeft = '8px';
    delBtn.addEventListener('click', () => {
      quotes.splice(index, 1);
      saveQuotes();
      renderQuotes();
    });

    li.appendChild(textSpan);
    li.appendChild(delBtn);
    quotesList.appendChild(li);
  });
}

// 6. Add new quote (called when user clicks Add)
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text) {
    alert('Please enter a quote.');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();      // persist change to localStorage
  renderQuotes();    // update UI
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

// 7. Export quotes to JSON file
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// 8. Import quotes from uploaded JSON file
function importFromJsonFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert('Imported JSON must be an array of quotes.');
        return;
      }
      // validate and normalize entries
      const normalized = imported.map(item => {
        if (typeof item === 'string') return { text: item, category: '' };
        return { text: item.text || '', category: item.category || '' };
      }).filter(item => item.text);

      // Option A: append imported quotes
      quotes.push(...normalized);

      // Option B (alternative): replace existing
      // quotes = normalized;

      saveQuotes();
      renderQuotes();
      alert('Quotes imported successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to import JSON. Make sure the file contains valid JSON.');
    }
  };
  reader.readAsText(file);
}

// 9. Clear all quotes (dangerous - confirm)
function clearAllQuotes() {
  if (!confirm('Are you sure you want to delete all quotes?')) return;
  quotes = [];
  saveQuotes();
  renderQuotes();
  sessionStorage.removeItem('lastViewedQuote');
  updateLastViewed();
}

// 10. Update last viewed from sessionStorage (demo of sessionStorage)
function updateLastViewed() {
  const stored = sessionStorage.getItem('lastViewedQuote');
  if (stored) {
    try {
      const q = JSON.parse(stored);
      lastViewed.textContent = `"${q.text}" (${q.category || 'uncategorized'})`;
    } catch {
      lastViewed.textContent = 'None';
    }
  } else {
    lastViewed.textContent = 'None';
  }
}

// 11. Wire up event listeners
addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportQuotesToJson);
importFile.addEventListener('change', (e) => importFromJsonFile(e.target.files[0]));
clearBtn.addEventListener('click', clearAllQuotes);

// 12. Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  renderQuotes();
  updateLastViewed();
});
