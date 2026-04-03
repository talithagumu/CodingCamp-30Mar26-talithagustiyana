// ==============================================
// EXPENSE & BUDGET VISUALIZER — app.js
//
// How this file is organized:
//   1. Config & constants
//   2. Get references to HTML elements
//   3. Load saved data from localStorage
//   4. Theme (dark / light mode)
//   5. Categories
//   6. Spending limit
//   7. Render functions (update what's on screen)
//   8. Event listeners (respond to user actions)
//   9. Helper functions
//  10. Start the app
// ==============================================


// ==============================================
// 1. CONFIG & CONSTANTS
// ==============================================

// Keys used to save data in the browser's localStorage
const STORAGE_KEYS = {
  transactions: 'expense_transactions',
  categories:   'expense_categories',
  limit:        'expense_limit',
  theme:        'expense_theme',
};

// Colors for each category (cycles if more than 10 categories)
const CATEGORY_COLORS = [
  '#7b6fe8', // lavender
  '#3ab0e0', // blue
  '#e8709a', // pink
  '#c9a84c', // gold
  '#5bc8c0', // teal
  '#a78bfa', // purple
  '#f0a0c0', // rose
  '#6ec6e8', // sky
  '#d4a0e0', // lilac
  '#f0c060', // warm yellow
];

// Light background tints for category badges
const CATEGORY_TINTS = [
  '#CDC1FF', // lavender
  '#BFECFF', // blue
  '#FFCCEA', // pink
  '#FFF6E3', // cream
  '#d0f5f0', // teal
  '#ede9ff', // purple
  '#ffe4ef', // rose
  '#ddf3ff', // sky
  '#f0e0ff', // lilac
  '#fff3d0', // yellow
];


// ==============================================
// 2. HTML ELEMENT REFERENCES
// We grab all the elements we need once at the top,
// so we don't have to search for them repeatedly.
// ==============================================

const el = {
  // Header
  themeToggle:  document.getElementById('themeToggle'),
  themeIcon:    document.getElementById('themeIcon'),

  // Balance banner
  totalBalance: document.getElementById('totalBalance'),
  heroTxCount:  document.getElementById('heroTxCount'),

  // Quick stats
  statMonth:    document.getElementById('statMonth'),
  statTop:      document.getElementById('statTop'),
  statCats:     document.getElementById('statCats'),

  // Spending limit
  spendLimit:   document.getElementById('spendLimit'),
  setLimitBtn:  document.getElementById('setLimitBtn'),
  limitBarWrap: document.getElementById('limitBarWrap'),
  limitBarFill: document.getElementById('limitBarFill'),
  limitStatus:  document.getElementById('limitStatus'),

  // Add transaction form
  form:         document.getElementById('transactionForm'),
  itemName:     document.getElementById('itemName'),
  amount:       document.getElementById('amount'),
  category:     document.getElementById('category'),
  addCatBtn:    document.getElementById('addCatBtn'),

  // Monthly summary
  monthPicker:     document.getElementById('monthPicker'),
  monthlySummary:  document.getElementById('monthlySummary'),

  // Transaction list
  transactionList: document.getElementById('transactionList'),
  emptyMsg:        document.getElementById('emptyMsg'),
  sortSelect:      document.getElementById('sortSelect'),

  // Chart
  chartCanvas:  document.getElementById('spendingChart'),
  chartEmpty:   document.getElementById('chartEmpty'),
};


// ==============================================
// 3. APP STATE
// These variables hold the current data.
// ==============================================

let transactions = loadFromStorage(STORAGE_KEYS.transactions, []);
let categories   = loadFromStorage(STORAGE_KEYS.categories, ['Food', 'Transport', 'Fun']);
let spendLimit   = loadFromStorage(STORAGE_KEYS.limit, 0);
let chart        = null; // will hold the Chart.js instance


// ==============================================
// 4. THEME (dark / light mode)
// ==============================================

function applyTheme(theme) {
  // Set the data-theme attribute on <html> — CSS reads this
  document.documentElement.setAttribute('data-theme', theme);

  // Update the toggle button icon
  el.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';

  // Save preference so it persists on refresh
  saveToStorage(STORAGE_KEYS.theme, theme);

  // Re-draw the chart so its colors match the new theme
  if (chart) drawChart();
}

el.themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


// ==============================================
// 5. CATEGORIES
// ==============================================

// Fill the <select> dropdown with current categories
function buildCategoryDropdown() {
  el.category.innerHTML = '';
  categories.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    el.category.appendChild(option);
  });
}

// Add a new custom category
el.addCatBtn.addEventListener('click', () => {
  const input = prompt('Enter a new category name:');
  if (!input) return;

  const name = input.trim();
  if (!name) return;

  // Don't allow duplicates (case-insensitive)
  const alreadyExists = categories.some(c => c.toLowerCase() === name.toLowerCase());
  if (alreadyExists) {
    alert('That category already exists.');
    return;
  }

  categories.push(name);
  saveToStorage(STORAGE_KEYS.categories, categories);
  buildCategoryDropdown();
  el.category.value = name; // select the new one
});

// Get the color for a category based on its position in the list
function getCategoryColor(categoryName) {
  const index = categories.indexOf(categoryName);
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

// Get the light tint color for a category badge
function getCategoryTint(categoryName) {
  const index = categories.indexOf(categoryName);
  return CATEGORY_TINTS[index % CATEGORY_TINTS.length];
}


// ==============================================
// 6. SPENDING LIMIT
// ==============================================

el.setLimitBtn.addEventListener('click', () => {
  const value = parseFloat(el.spendLimit.value);
  spendLimit = isNaN(value) || value < 0 ? 0 : value;
  saveToStorage(STORAGE_KEYS.limit, spendLimit);
  updateLimitBar();
});

function updateLimitBar() {
  // If no limit is set, hide the progress bar
  if (!spendLimit || spendLimit <= 0) {
    el.limitBarWrap.style.display = 'none';
    return;
  }

  const totalSpent = sumAmounts(transactions);
  const percentage = Math.min((totalSpent / spendLimit) * 100, 100);

  el.limitBarWrap.style.display = 'flex';
  el.limitBarFill.style.width = percentage + '%';

  if (totalSpent > spendLimit) {
    // Over budget
    el.limitBarFill.classList.add('over');
    el.limitStatus.textContent = `⚠️ Over limit by ${formatRupiah(totalSpent - spendLimit)}`;
    el.limitStatus.className = 'limit-status limit-warn';
  } else {
    // Under budget
    el.limitBarFill.classList.remove('over');
    el.limitStatus.textContent = `✓ ${formatRupiah(spendLimit - totalSpent)} remaining (${Math.round(percentage)}% used)`;
    el.limitStatus.className = 'limit-status limit-ok';
  }
}


// ==============================================
// 7. RENDER FUNCTIONS
// Each function updates one part of the screen.
// ==============================================

// Master render — calls all the individual update functions
function renderAll() {
  updateBalance();
  updateStats();
  updateLimitBar();
  updateTransactionList();
  drawChart();
  buildMonthDropdown();
  updateMonthlySummary();
}

// --- Balance banner ---
function updateBalance() {
  const total = sumAmounts(transactions);
  const count = transactions.length;

  // Trigger bounce animation
  el.totalBalance.classList.remove('bump');
  void el.totalBalance.offsetWidth; // force browser to reset animation
  el.totalBalance.classList.add('bump');

  el.totalBalance.textContent = formatRupiah(total);
  el.heroTxCount.textContent  = `${count} transaction${count !== 1 ? 's' : ''}`;
}

// --- Quick stats row ---
function updateStats() {
  const now = new Date();

  // Filter transactions from the current month
  const thisMonthTx = transactions.filter(t => {
    const date = new Date(t.isoDate || t.id);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });

  el.statMonth.textContent = formatRupiah(sumAmounts(thisMonthTx));

  // Find the single most expensive transaction
  const biggest = transactions.reduce((max, t) => t.amount > (max?.amount ?? 0) ? t : max, null);
  el.statTop.textContent = biggest ? escapeHtml(biggest.name) : '—';

  // Count unique categories that have been used
  const usedCategories = new Set(transactions.map(t => t.category));
  el.statCats.textContent = usedCategories.size;
}

// --- Transaction list ---
function updateTransactionList() {
  el.transactionList.innerHTML = '';

  // Show "no transactions" message if list is empty
  el.emptyMsg.style.display = transactions.length === 0 ? 'block' : 'none';

  getSortedTransactions().forEach((transaction, index) => {
    const isOverLimit = spendLimit > 0 && transaction.amount > spendLimit;
    const color = getCategoryColor(transaction.category);
    const tint  = getCategoryTint(transaction.category);

    const li = document.createElement('li');
    li.className = 'tx-item' + (isOverLimit ? ' over-limit' : '');
    li.style.animationDelay = `${index * 40}ms`; // stagger the slide-in animation

    li.innerHTML = `
      <span class="tx-name">
        <span class="tx-dot" style="background: ${color}"></span>
        ${escapeHtml(transaction.name)}
      </span>
      <span class="tx-amount ${isOverLimit ? 'over-limit' : ''}">
        ${formatRupiah(transaction.amount)}
      </span>
      <span class="tx-badge" style="background: ${tint}; color: ${color}">
        ${escapeHtml(transaction.category)}
      </span>
      <span class="tx-date">${transaction.date}</span>
      <button class="btn-delete" data-id="${transaction.id}" aria-label="Delete ${escapeHtml(transaction.name)}">
        Remove
      </button>
    `;

    el.transactionList.appendChild(li);
  });
}

// Return transactions sorted by the current sort option
function getSortedTransactions() {
  const list = [...transactions]; // copy so we don't mutate the original

  switch (el.sortSelect.value) {
    case 'date-asc':    return list.sort((a, b) => a.id - b.id);
    case 'amount-desc': return list.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':  return list.sort((a, b) => a.amount - b.amount);
    case 'category':    return list.sort((a, b) => a.category.localeCompare(b.category));
    default:            return list.sort((a, b) => b.id - a.id); // newest first
  }
}

// --- Doughnut chart ---
function drawChart() {
  // Add up spending per category
  const totals = {};
  transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals).filter(k => totals[k] > 0);
  const data   = labels.map(k => totals[k]);
  const colors = labels.map(k => getCategoryColor(k));
  const hasData = data.length > 0;

  // Show/hide chart vs empty message
  el.chartEmpty.style.display  = hasData ? 'none'  : 'block';
  el.chartCanvas.style.display = hasData ? 'block' : 'none';

  if (!hasData) {
    if (chart) { chart.destroy(); chart = null; }
    return;
  }

  const isDark      = document.documentElement.getAttribute('data-theme') === 'dark';
  const legendColor = isDark ? '#b8b0d8' : '#4a4060';

  if (chart) {
    // Update existing chart instead of recreating it
    chart.data.labels = labels;
    chart.data.datasets[0].data            = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.options.plugins.legend.labels.color = legendColor;
    chart.update('active');
  } else {
    // Create the chart for the first time
    chart = new Chart(el.chartCanvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: isDark ? '#231e35' : '#ffffff',
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        cutout: '62%',
        animation: { animateRotate: true, duration: 600 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 11, weight: '600', family: 'Plus Jakarta Sans' },
              color: legendColor,
              padding: 14,
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
          tooltip: {
            callbacks: {
              // Show formatted currency in tooltip
              label: ctx => `  ${ctx.label}: ${formatRupiah(ctx.parsed)}`,
            },
          },
        },
      },
    });
  }
}

// --- Month picker dropdown ---
function buildMonthDropdown() {
  // Collect all unique "YYYY-MM" values from transactions
  const months  = new Set(transactions.map(t => getYearMonth(t)));
  const current = getYearMonth(null); // current month

  if (!months.has(current)) months.add(current);

  const sorted     = [...months].sort((a, b) => b.localeCompare(a)); // newest first
  const selected   = el.monthPicker.value || current;

  el.monthPicker.innerHTML = '';
  sorted.forEach(ym => {
    const option = document.createElement('option');
    option.value = ym;
    option.textContent = formatMonthLabel(ym);
    if (ym === selected) option.selected = true;
    el.monthPicker.appendChild(option);
  });
}

// --- Monthly summary cards ---
function updateMonthlySummary() {
  const selectedMonth = el.monthPicker.value;
  const filtered = transactions.filter(t => getYearMonth(t) === selectedMonth);

  if (filtered.length === 0) {
    el.monthlySummary.innerHTML = '<p class="empty-msg">🗓️<br>No transactions this month.</p>';
    return;
  }

  const total      = sumAmounts(filtered);
  const byCategory = {};
  filtered.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  // Build the "Total Spent" card
  let html = `
    <div class="summary-stat">
      <div class="summary-stat-label">Total Spent</div>
      <div class="summary-stat-value">${formatRupiah(total)}</div>
      <div class="summary-stat-count">${filtered.length} transactions</div>
    </div>
  `;

  // Build one card per category, sorted by amount (highest first)
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      const color = getCategoryColor(category);
      const pct   = Math.round((amount / total) * 100);
      html += `
        <div class="summary-stat" style="border-top: 3px solid ${color}">
          <div class="summary-stat-label">${escapeHtml(category)}</div>
          <div class="summary-stat-value" style="color: ${color}">${formatRupiah(amount)}</div>
          <div class="summary-stat-count">${pct}%</div>
        </div>
      `;
    });

  el.monthlySummary.innerHTML = html;
}


// ==============================================
// 8. EVENT LISTENERS
// ==============================================

// Add a new transaction when the form is submitted
el.form.addEventListener('submit', e => {
  e.preventDefault(); // stop the page from reloading

  const name     = el.itemName.value.trim();
  const amount   = parseFloat(el.amount.value);
  const category = el.category.value;

  // Validate inputs
  if (!name || isNaN(amount) || amount <= 0) {
    alert('Please fill in all fields with valid values.');
    return;
  }

  // Add the new transaction to our list
  transactions.push({
    id:      Date.now(),       // unique ID based on timestamp
    name,
    amount,
    category,
    isoDate: new Date().toISOString(),                    // for month filtering
    date:    new Date().toLocaleDateString('id-ID'),      // display date
  });

  saveToStorage(STORAGE_KEYS.transactions, transactions);
  renderAll();

  el.form.reset();
  el.itemName.focus(); // ready for next entry
});

// Delete a transaction when the ✕ button is clicked
el.transactionList.addEventListener('click', e => {
  if (!e.target.classList.contains('btn-delete')) return;

  const id = Number(e.target.dataset.id);
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage(STORAGE_KEYS.transactions, transactions);
  renderAll();
});

// Re-sort the list when the sort dropdown changes
el.sortSelect.addEventListener('change', updateTransactionList);

// Update the summary when a different month is selected
el.monthPicker.addEventListener('change', updateMonthlySummary);


// ==============================================
// 9. HELPER FUNCTIONS
// Small reusable utilities.
// ==============================================

// Save any value to localStorage as JSON
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Load a value from localStorage, return fallback if not found
function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

// Add up all the amounts in a list of transactions
function sumAmounts(list) {
  return list.reduce((total, t) => total + t.amount, 0);
}

// Format a number as Indonesian Rupiah: Rp15.000
function formatRupiah(value) {
  return 'Rp' + Math.round(value).toLocaleString('id-ID');
}

// Return "YYYY-MM" string for a transaction (or current month if null)
function getYearMonth(transaction) {
  const date = transaction
    ? new Date(transaction.isoDate || transaction.id)
    : new Date();
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Format "2026-04" as "April 2026"
function formatMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-');
  return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Prevent XSS by escaping special HTML characters in user input
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


// ==============================================
// 10. START THE APP
// ==============================================

// Apply saved theme (or default to light)
applyTheme(loadFromStorage(STORAGE_KEYS.theme, 'light'));

// Restore saved spending limit into the input field
if (spendLimit > 0) el.spendLimit.value = spendLimit;

// Build the category dropdown
buildCategoryDropdown();

// Render everything on the page
renderAll();
