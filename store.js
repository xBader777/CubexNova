const PAYPAL_BASE_LINK = "https://www.paypal.com/paypalme/MohammedAlshboul689";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "change-this-password";

const CART_KEY = "cubexnovaCart";
const PRODUCTS_KEY = "cubexnovaProducts";
const ADMIN_KEY = "cubexnovaAdmin";

let toastTimer;

const defaultProducts = [
  {
    id: "gold",
    category: "Ranks",
    name: "Gold Rank",
    price: 3.99,
    material: "GOLD_INGOT",
    description: "Includes a Gold rank title, profile badge, and special display color.",
    commands: ["lp user {player} parent set gold"]
  },
  {
    id: "diamond",
    category: "Ranks",
    name: "Diamond Rank",
    price: 7.99,
    material: "DIAMOND",
    description: "Includes a Diamond rank title, premium badge, and upgraded display style.",
    commands: ["lp user {player} parent set diamond"]
  },
  {
    id: "emerald",
    category: "Ranks",
    name: "Emerald Rank",
    price: 11.99,
    material: "EMERALD",
    description: "Includes an Emerald rank title, exclusive badge, and custom profile look.",
    commands: ["lp user {player} parent set emerald"]
  },
  {
    id: "cube",
    category: "Ranks",
    name: "Cube Rank",
    price: 15.99,
    material: "PURPLE_SHULKER_BOX",
    description: "Includes the Cube rank title, rare badge, and the highest display style.",
    commands: ["lp user {player} parent set cube"]
  },
  {
    id: "guild_create",
    category: "Other",
    name: "Guild Create",
    price: 9.99,
    material: "NETHER_STAR",
    description: "Unlock the ability to create your own guild.",
    commands: ["lp user {player} permission set cubexnova.guild.create true"]
  }
];

function products() {
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || structuredClone(defaultProducts);
}

function saveProducts(data) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data, null, 2));
}

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

  const data = products();

  if (ranks) {
    ranks.innerHTML = data
      .filter(p => p.category === "Ranks")
      .map(cardHTML)
      .join("");
  }

  if (other) {
    other.innerHTML = data
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
  data.push({ name, price: Number(price) });
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

/* Admin Panel */

function createAdmin() {
  const div = document.createElement("div");

  div.innerHTML = `
    <button class="admin-open" onclick="openAdmin()">Admin Panel</button>

    <div class="admin-overlay" id="adminOverlay">
      <div class="admin-box">
        <div class="admin-top">
          <h2>Admin Panel</h2>
          <button class="remove" onclick="closeAdmin()">Close</button>
        </div>

        <div id="adminLogin">
          <div class="admin-warning">
            Store is public. Admin login is not fully secure on GitHub Pages.
          </div>

          <label>Username</label>
          <input id="adminUser" type="text">

          <label>Password</label>
          <input id="adminPass" type="password">

          <button onclick="loginAdmin()">Login</button>
        </div>

        <div id="adminEditor" class="hidden">
          <div class="admin-warning">
            Edit names, prices, descriptions, materials, and plugin commands.
          </div>

          <div class="admin-grid" id="adminGrid"></div>

          <br>
          <button onclick="saveAdmin()">Save Changes</button>
          <button onclick="downloadConfig()">Download config.yml</button>
          <button onclick="copyConfig()">Copy config.yml</button>
          <button onclick="resetAdmin()">Reset Defaults</button>
          <button onclick="logoutAdmin()">Logout</button>

          <pre id="configPreview"></pre>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(div);
}

function openAdmin() {
  document.getElementById("adminOverlay").classList.add("show");

  if (sessionStorage.getItem(ADMIN_KEY) === "yes") {
    showEditor();
  } else {
    showLogin();
  }
}

function closeAdmin() {
  document.getElementById("adminOverlay").classList.remove("show");
}

function showLogin() {
  document.getElementById("adminLogin").classList.remove("hidden");
  document.getElementById("adminEditor").classList.add("hidden");
}

function showEditor() {
  document.getElementById("adminLogin").classList.add("hidden");
  document.getElementById("adminEditor").classList.remove("hidden");
  renderAdmin();
}

function loginAdmin() {
  const u = document.getElementById("adminUser").value.trim();
  const p = document.getElementById("adminPass").value.trim();

  if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, "yes");
    showEditor();
  } else {
    alert("Wrong username or password.");
  }
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_KEY);
  showLogin();
}

function renderAdmin() {
  const grid = document.getElementById("adminGrid");
  const data = products();

  grid.innerHTML = data.map((p, i) => `
    <div class="admin-product">
      <h3>${escapeHTML(p.name)}</h3>

      <label>ID</label>
      <input value="${escapeHTML(p.id)}" disabled>

      <label>Category</label>
      <select id="cat${i}">
        <option ${p.category === "Ranks" ? "selected" : ""}>Ranks</option>
        <option ${p.category === "Other" ? "selected" : ""}>Other</option>
      </select>

      <label>Name</label>
      <input id="name${i}" value="${escapeHTML(p.name)}">

      <label>Price</label>
      <input id="price${i}" type="number" step="0.01" value="${Number(p.price).toFixed(2)}">

      <label>Minecraft Material</label>
      <input id="mat${i}" value="${escapeHTML(p.material)}">

      <label>Description</label>
      <textarea id="desc${i}">${escapeHTML(p.description)}</textarea>

      <label>Commands</label>
      <textarea id="cmd${i}">${escapeHTML(p.commands.join("\n"))}</textarea>
    </div>
  `).join("");

  updateConfigPreview();
}

function readAdmin() {
  const old = products();

  return old.map((p, i) => ({
    id: p.id,
    category: document.getElementById("cat" + i).value,
    name: document.getElementById("name" + i).value.trim() || p.name,
    price: parseFloat(document.getElementById("price" + i).value) || p.price,
    material: document.getElementById("mat" + i).value.trim() || "CHEST",
    description: document.getElementById("desc" + i).value.trim(),
    commands: document.getElementById("cmd" + i).value
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean)
      .map(x => x.startsWith("/") ? x.substring(1) : x)
  }));
}

function saveAdmin() {
  saveProducts(readAdmin());
  renderProducts();
  updateConfigPreview();
  toast("Saved changes");
}

function resetAdmin() {
  if (!confirm("Reset all products?")) return;
  localStorage.removeItem(PRODUCTS_KEY);
  renderAdmin();
  renderProducts();
}

function configYml() {
  const data = readAdmin();

  let yml = `settings:\n  prefix: "&8[&bCubexNova Store&8] &r"\n\nproducts:\n`;

  data.forEach(p => {
    yml += `  ${p.id}:\n`;
    yml += `    display-name: "${yaml(colorName(p))}"\n`;
    yml += `    material: "${yaml(p.material)}"\n`;
    yml += `    price: ${Number(p.price).toFixed(2)}\n`;
    yml += `    commands:\n`;

    if (p.commands.length === 0) {
      yml += `      - "say No commands configured for {player}"\n`;
    } else {
      p.commands.forEach(cmd => {
        yml += `      - "${yaml(cmd)}"\n`;
      });
    }

    yml += `\n`;
  });

  return yml;
}

function colorName(p) {
  if (p.id === "gold") return "&6" + p.name;
  if (p.id === "diamond") return "&b" + p.name;
  if (p.id === "emerald") return "&a" + p.name;
  if (p.id === "cube") return "&d" + p.name;
  if (p.id === "guild_create") return "&e" + p.name;
  return p.name;
}

function updateConfigPreview() {
  const pre = document.getElementById("configPreview");
  if (pre) pre.textContent = configYml();
}

function downloadConfig() {
  saveAdmin();
  const blob = new Blob([configYml()], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "config.yml";
  a.click();
  URL.revokeObjectURL(url);
}

function copyConfig() {
  saveAdmin();
  navigator.clipboard.writeText(configYml());
  alert("config.yml copied.");
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
  return String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function yaml(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

document.addEventListener("input", e => {
  if (e.target.closest("#adminEditor")) updateConfigPreview();
});

document.addEventListener("DOMContentLoaded", () => {
  createAdmin();
  updateCartCount();
  renderProducts();
  renderCart();
});
