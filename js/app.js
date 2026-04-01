const STORAGE_KEY = 'expense_transactions';

const form = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const totalBalanceEl = document.getElementById('totalBalance');
const transactionList = document.getElementById('transactionList');
const emptyMsg = document.getElementById('emptyMsg');
const chartEmpty = document.getElementById('chartEmpty');
const chartCanvas = document.getElementById('spendingChart');

const CATEGORY_COLORS = {
  Food: '#2ecc71',
  Transport: '#3498db',
  Fun: '#e67e22',
};

let transactions = loadTransactions();
let chart = null;

// --- Storage ---
function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// --- Render ---
function render() {
  renderBalance();
  renderList();
  renderChart();
}

function renderBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  totalBalanceEl.textContent = formatCurrency(total);
}

function renderList() {
  transactionList.innerHTML = '';
  emptyMsg.style.display = transactions.length === 0 ? 'block' : 'none';

  transactions.forEach((t) => {
    const li = document.createElement('li');
    li.className = 'tx-item';
    li.innerHTML = `
      <div class="tx-info">
        <div class="tx-name">${escapeHtml(t.name)}</div>
        <div class="tx-amount">${formatCurrency(t.amount)}</div>
        <span class="tx-badge">${escapeHtml(t.category)}</span>
      </div>
      <button class="btn-delete" data-id="${t.id}">Delete</button>
    `;
    transactionList.appendChild(li);
  });
}

function renderChart() {
  const totals = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach((t) => { totals[t.category] += t.amount; });

  const labels = Object.keys(totals).filter((k) => totals[k] > 0);
  const data = labels.map((k) => totals[k]);
  const colors = labels.map((k) => CATEGORY_COLORS[k]);
  const hasData = data.length > 0;

  chartEmpty.style.display = hasData ? 'none' : 'block';
  chartCanvas.style.display = hasData ? 'block' : 'none';

  if (!hasData) {
    if (chart) { chart.destroy(); chart = null; }
    return;
  }

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update();
  } else {
    chart = new Chart(chartCanvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`,
            },
          },
        },
      },
    });
  }
}

// --- Events ---
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!name || isNaN(amount) || amount <= 0) {
    alert('Please fill in all fields with valid values.');
    return;
  }

  transactions.push({ id: Date.now(), name, amount, category });
  saveTransactions();
  render();

  form.reset();
  itemNameInput.focus();
});

transactionList.addEventListener('click', (e) => {
  if (!e.target.classList.contains('btn-delete')) return;
  const id = Number(e.target.dataset.id);
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  render();
});

// --- Helpers ---
function formatCurrency(value) {
  return 'Rp' + Math.round(value).toLocaleString('id-ID');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- Init ---
render();
