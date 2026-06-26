const PAYPAL_BASE_LINK = "https://www.paypal.com/paypalme/MohammedAlshboul689";

const CART_KEY = "cubexnovaCart";

let toastTimer;

const products = [
  {
    id: "gold",
    category: "Ranks",
    name: "Gold Rank",
    price: 3.99,
    description: "Includes a Gold rank title, profile badge, and special display color."
  },
  {
    id: "diamond",
    category: "Ranks",
    name: "Diamond Rank",
    price: 7.99,
    description: "Includes a Diamond rank title, premium badge, and upgraded display style."
  },
  {
    id: "emerald",
    category: "Ranks",
    name: "Emerald Rank",
    price: 11.99,
    description: "Includes an Emerald rank title, exclusive badge, and custom profile look."
  },
  {
    id: "cube",
    category: "Ranks",
    name: "Cube Rank",
    price: 15.99,
    description: "Includes the Cube rank title, rare badge, and the highest display style."
  },
  {
    id: "guild_create",
    category: "Other",
    name: "Guild Create",
    price: 9.99,
    description: "Unlock the ability to create your own guild."
  }
];

function cart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(data) {
  localStorage.setItem(CART_KEY, JSON.stringify(data));
}

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;

  el.textContent = msg;
  el.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.textContent = cart().length;
}

function productClass(id) {
  if (id === "gold") return "gold";
  if (id === "diamond") return "diamond";
  if (id === "emerald") return "emerald";
  if (id === "cube") return "cube";
  return "other";
}

function productIcon(id) {
  if (id === "gold") return "G";
  if (id === "diamond") return "D";
  if (id === "emerald") return "E";
  if (id === "cube") return "C";
  return "★";
}

function renderProducts() {
  const ranks = document.getElementById("ranksProducts");
  const other = document.getElementById("otherProducts");

  if (!ranks && !other) return;

  if (ranks) {
    ranks.innerHTML = products
      .filter(p => p.category === "Ranks")
      .map(cardHTML)
      .join("");
  }

  if (other) {
    other.innerHTML = products
      .filter(p => p.category === "Other")
      .map(cardHTML)
      .join("");
  }
}

function cardHTML(p) {
  return `
    <div class="card ${productClass(p.id)}">
      <div class="icon">${productIcon(p.id)}</div>
      <h3>${escapeHTML(p.name)}</h3>
      <p>${escapeHTML(p.description)}</p>
      <div class="price">$${Number(p.price).toFixed(2)}</div>
      <button onclick="addToCart('${escapeJS(p.name)}', ${Number(p.price).toFixed(2)}, this)">Add to Cart</button>
    </div>
  `;
}

function addToCart(name, price, btn) {
  const data = cart();

  data.push({
    name: name,
    price: Number(price)
  });

  saveCart(data);
  updateCartCount();

  if (btn) {
    const old = btn.textContent;
    btn.textContent = "Added!";
    btn.classList.add("added");

    setTimeout(() => {
      btn.textContent = old;
      btn.classList.remove("added");
    }, 1200);
  }

  toast("✅ " + name + " added to cart");
}

function renderCart() {
  const items = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  if (!items || !totalEl) return;

  const data = cart();
  let total = 0;

  if (data.length === 0) {
    items.innerHTML = `<p>Your cart is empty.</p>`;
    totalEl.textContent = "0.00";
    return;
  }

  items.innerHTML = data.map((item, i) => {
    total += Number(item.price);

    return `
      <div class="cart-item">
        <span>${escapeHTML(item.name)} - $${Number(item.price).toFixed(2)}</span>
        <button class="remove" onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  }).join("");

  totalEl.textContent = total.toFixed(2);
}

function removeItem(index) {
  const data = cart();
  const removed = data[index]?.name || "Item";

  data.splice(index, 1);
  saveCart(data);

  renderCart();
  updateCartCount();
  toast("Removed " + removed);
}

function checkoutPayPal() {
  const data = cart();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();

  if (data.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!username || !email) {
    alert("Please enter username and email.");
    return;
  }

  const total = data.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2);
  const names = data.map(i => i.name).join(", ");

  window.open(PAYPAL_BASE_LINK + "/" + total, "_blank", "noopener,noreferrer");

  alert(
    "PayPal opened in a new tab.\n\n" +
    "Username: " + username + "\n" +
    "Email: " + email + "\n" +
    "Products: " + names + "\n" +
    "Total: $" + total + "\n\n" +
    "After paying, include your username in the PayPal note if possible."
  );
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeJS(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderProducts();
  renderCart();
});
