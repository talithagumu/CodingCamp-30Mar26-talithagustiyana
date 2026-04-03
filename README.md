# 💸 Expense & Budget Visualizer

A mobile-friendly web app to track daily spending, visualize expenses by category, and manage a monthly budget — all without any backend or login required.

---

## 🚀 Tech Stack

| Layer      | Technology |
|------------|------------|
| Structure  | HTML5 (semantic elements) |
| Styling    | CSS3 (custom properties, CSS Grid, Flexbox) |
| Logic      | Vanilla JavaScript (ES6+) |
| Chart      | [Chart.js v4](https://www.chartjs.org/) via CDN |
| Font       | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via Google Fonts |
| Storage    | Browser `localStorage` (no backend needed) |

> No frameworks, no build tools, no installation required. Just open `index.html` in a browser.

---

## ✨ Features

### 💰 Balance Overview
- Lavender banner at the top always shows the **total amount spent**
- Updates instantly when a transaction is added or removed
- Shows total transaction count

### 📊 Quick Stats
- **This Month** — sum of all transactions in the current calendar month
- **Biggest Spend** — name of the single most expensive transaction
- **Categories** — count of unique categories currently in use

### 🎯 Spending Limit
- Set a custom monthly budget cap
- Animated progress bar fills as you spend
- Turns red and shows an over-budget warning when the limit is exceeded
- Persists across page refreshes

### ➕ Add Transaction
- Fields: Item Name, Amount (Rp), Category
- Validates that all fields are filled and amount is positive
- Date is recorded automatically on submission

### 🗂️ Custom Categories
- Default categories: Food, Transport, Fun
- Add unlimited custom categories with the **＋ New** button
- Each category gets a unique color used across the badge, dot, and chart

### 🧾 Expense History Table
- Displays: Name, Amount, Category (colored badge), Date, Remove button
- **Sort** by: Newest, Oldest, Amount ↑↓, Category
- Rows over the spending limit are highlighted in amber
- Scrollable list with up to 420px height

### 📆 Monthly Summary
- Filter by month using the dropdown
- Shows total spent + a breakdown card per category with percentage
- Category cards have a colored top border matching their chart color

### 🍩 Spending Chart
- Doughnut chart powered by Chart.js
- Updates live as transactions are added or removed
- Tooltip shows formatted Rupiah amount on hover
- Legend positioned at the bottom with point-style markers

### 🌙 Dark / Light Mode
- Toggle button in the top-right corner
- Preference saved to `localStorage` — persists on refresh
- Chart legend color adapts to the active theme

### 💾 Persistent Storage
- All data (transactions, categories, spending limit, theme) saved in `localStorage`
- No account or internet connection needed after initial load
- Data survives page refreshes and browser restarts

---

## 📁 Project Structure

```
project/
├── index.html       # Page structure and semantic HTML
├── css/
│   └── style.css    # All styles, variables, dark mode, responsive
└── js/
    └── app.js       # All logic: state, render, events, helpers
```

---

## 🗺️ How to Use — Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Open index.html                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              App loads saved data from                  │
│         localStorage (transactions, categories,         │
│              spending limit, theme)                     │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
   │  Set a      │ │  Add a      │ │  Add a new   │
   │  Spending   │ │  Transaction│ │  Category    │
   │  Limit      │ │             │ │  (optional)  │
   └──────┬──────┘ └──────┬──────┘ └──────┬───────┘
          │               │               │
          ▼               ▼               ▼
   ┌─────────────┐ ┌──────────────────────────────┐
   │  Progress   │ │   Transaction saved to        │
   │  bar fills  │ │   localStorage                │
   │  or turns   │ │                               │
   │  red if     │ │   ┌──────────────────────┐    │
   │  over limit │ │   │  All panels update:  │    │
   └─────────────┘ │   │  • Balance banner    │    │
                   │   │  • Quick stats       │    │
                   │   │  • Expense table     │    │
                   │   │  • Doughnut chart    │    │
                   │   │  • Monthly summary   │    │
                   │   │  • Limit bar         │    │
                   │   └──────────────────────┘    │
                   └──────────────────────────────-┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
   │  Sort the   │ │  Filter by  │ │  Delete a    │
   │  table by   │ │  month in   │ │  transaction │
   │  name /     │ │  Monthly    │ │  (Remove     │
   │  amount /   │ │  Summary    │ │   button)    │
   │  category   │ └─────────────┘ └──────┬───────┘
   └─────────────┘                        │
                                          ▼
                                 ┌──────────────────┐
                                 │  Transaction      │
                                 │  removed from     │
                                 │  localStorage,    │
                                 │  all panels       │
                                 │  update again     │
                                 └──────────────────┘
```

---

## 🖥️ Running the App

No installation needed.

1. Clone or download this repository
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
3. Start adding transactions

```bash
# Optional: serve with a local server
npx serve .
# or
python -m http.server
```

---

## 🌐 Browser Compatibility

| Browser | Supported |
|---------|-----------|
| Chrome  | ✅ |
| Firefox | ✅ |
| Edge    | ✅ |
| Safari  | ✅ |

---

*Mini Project — Batch 30-03-2026*
