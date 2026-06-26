let toastTimer;

const PAYPAL_BASE_LINK = "https://www.paypal.com/paypalme/MohammedAlshboul689";

function getCart() {
  return JSON.parse(localStorage.getItem("cubexnovaCart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cubexnovaCart", JSON.stringify(cart));
}

function addToCart(name, price, button) {
  const cart = getCart();

  cart.push({
    name: name,
    price: price
  });

  saveCart(cart);
  updateCartCount();
  showAddedFeedback(name, button);
}

function showAddedFeedback(name, button) {
  showToast("✅ " + name + " added to cart");

  if (button) {
    const originalText = button.textContent;
    button.textContent = "Added!";
    button.classList.add("added-btn");

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("added-btn");
    }, 1200);
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  const cart = getCart();

  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

function renderCartPage() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems || !cartTotal) return;

  const cart = getCart();
  let total = 0;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p>Your cart is empty.</p>

      <div class="empty-cart-actions">
        <a href="index.html">View Ranks</a>
        <a href="other.html">View Other</a>
      </div>
    `;
  }

  cart.forEach((item, index) => {
    total += item.price;

    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name} - $${item.price.toFixed(2)}</span>
        <button class="remove" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
  });

  cartTotal.textContent = total.toFixed(2);
}

function removeFromCart(index) {
  const cart = getCart();

  if (!cart[index]) return;

  const removedItem = cart[index].name;

  cart.splice(index, 1);
  saveCart(cart);

  updateCartCount();
  renderCartPage();

  showToast("Removed " + removedItem);

  const cartBox = document.getElementById("cartBox");
  if (cartBox) {
    cartBox.classList.add("cart-flash");

    setTimeout(() => {
      cartBox.classList.remove("cart-flash");
    }, 800);
  }
}

function validateCheckout() {
  const cart = getCart();
  const username = document.getElementById("username")?.value.trim();
  const email = document.getElementById("email")?.value.trim();

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return false;
  }

  if (!username || !email) {
    alert("Please enter your game username and email.");
    return false;
  }

  return true;
}

function getOrderSummary() {
  const cart = getCart();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const products = cart.map(item => item.name).join(", ");

  return {
    username: username,
    email: email,
    total: total.toFixed(2),
    products: products
  };
}

function checkoutPayPal() {
  if (!validateCheckout()) return;

  const order = getOrderSummary();
  const paypalUrl = PAYPAL_BASE_LINK + "/" + order.total;

  window.open(paypalUrl, "_blank", "noopener,noreferrer");

  alert(
    "PayPal opened in a new tab.\n\n" +
    "Username: " + order.username + "\n" +
    "Email: " + order.email + "\n" +
    "Products: " + order.products + "\n" +
    "Total: $" + order.total + "\n\n" +
    "After paying, include your username in the PayPal note if possible."
  );
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCartPage();
});
