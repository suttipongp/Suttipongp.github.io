const defaultCoins = ["bitcoin", "ethereum", "solana", "binancecoin", "ripple", "dogecoin"];
const state = {
  coins: JSON.parse(localStorage.getItem("cryptoInfoCoins") || "null") || defaultCoins,
  currency: localStorage.getItem("cryptoInfoCurrency") || "usd",
  timer: null,
};

const currency = document.querySelector("#currency");
const statusEl = document.querySelector("#status");
const cardsEl = document.querySelector("#cards");
const tickerEl = document.querySelector("#ticker");
const template = document.querySelector("#coin-card-template");

currency.value = state.currency;

function saveState() {
  localStorage.setItem("cryptoInfoCoins", JSON.stringify(state.coins));
  localStorage.setItem("cryptoInfoCurrency", state.currency);
}

function formatMoney(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: state.currency.toUpperCase(),
    maximumFractionDigits: value >= 100 ? 2 : 6,
  }).format(value);
}

function formatCompact(value) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function setStatus(message) {
  statusEl.textContent = message;
}

function drawSparkline(canvas, points, isPositive) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const spread = max - min || 1;

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = isPositive ? "#38d98b" : "#ff5c70";
  ctx.beginPath();

  points.forEach((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point - min) / spread) * (height - 12) - 6;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

async function fetchMarket() {
  const ids = state.coins.join(",");
  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.search = new URLSearchParams({
    vs_currency: state.currency,
    ids,
    order: "market_cap_desc",
    per_page: "50",
    page: "1",
    sparkline: "true",
    price_change_percentage: "24h",
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error(`CoinGecko returned ${response.status}`);
  return response.json();
}

function renderTicker(coins) {
  tickerEl.replaceChildren(
    ...coins.map((coin) => {
      const change = coin.price_change_percentage_24h || 0;
      const item = document.createElement("div");
      item.className = "ticker-item";
      item.innerHTML = `
        <div class="ticker-name">${coin.symbol.toUpperCase()} 24h</div>
        <div class="ticker-price">${formatMoney(coin.current_price)}</div>
        <div class="${change >= 0 ? "positive" : "negative"}">${change.toFixed(2)}%</div>
      `;
      return item;
    }),
  );
}

function renderCards(coins) {
  cardsEl.replaceChildren(
    ...coins.map((coin) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const change = coin.price_change_percentage_24h || 0;
      card.querySelector(".remove").addEventListener("click", () => removeCoin(coin.id));
      card.querySelector(".coin-image").src = coin.image;
      card.querySelector(".coin-image").alt = `${coin.name} logo`;
      card.querySelector(".coin-name").textContent = coin.name;
      card.querySelector(".coin-symbol").textContent = coin.symbol;
      card.querySelector(".coin-price").textContent = formatMoney(coin.current_price);
      card.querySelector(".change").textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}% 24h`;
      card.querySelector(".change").className = `change ${change >= 0 ? "positive" : "negative"}`;
      card.querySelector(".volume").textContent = `Vol ${formatCompact(coin.total_volume || 0)}`;
      drawSparkline(card.querySelector(".sparkline"), coin.sparkline_in_7d?.price || [coin.current_price], change >= 0);
      return card;
    }),
  );
}

async function refreshMarket() {
  try {
    setStatus("Updating live prices...");
    const coins = await fetchMarket();
    const ordered = state.coins.map((id) => coins.find((coin) => coin.id === id)).filter(Boolean);
    renderTicker(ordered);
    renderCards(ordered);
    setStatus(`Live from CoinGecko. Updated ${new Date().toLocaleTimeString()}. Auto-refresh: 30s.`);
  } catch (error) {
    setStatus(`Could not update prices: ${error.message}`);
  }
}

function removeCoin(id) {
  state.coins = state.coins.filter((coin) => coin !== id);
  saveState();
  refreshMarket();
}

document.querySelector("#coin-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#coin-input");
  const id = input.value.trim().toLowerCase();
  if (!id || state.coins.includes(id)) return;
  state.coins.push(id);
  input.value = "";
  saveState();
  refreshMarket();
});

document.querySelector("#refresh").addEventListener("click", refreshMarket);
currency.addEventListener("change", () => {
  state.currency = currency.value;
  saveState();
  refreshMarket();
});

refreshMarket();
state.timer = setInterval(refreshMarket, 30000);
