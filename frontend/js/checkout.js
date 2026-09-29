const checkoutContainer = document.getElementById("checkoutContainer");
const logoutBtn = document.getElementById("logoutBtn");
const token = localStorage.getItem("token");

// ========================= CHECK LOGIN =========================

if (!token) {
    window.location.href = "login.html";
} else {
    loadCheckout();
}

// ========================= LOAD CHECKOUT =========================

async function loadCheckout() {
    try {
        // Get selected cart item IDs
        const storedSelectedIds = sessionStorage.getItem("selectedCartItemIds");

        if (!storedSelectedIds) {
            checkoutContainer.innerHTML = `
                <p class="message">
                    No products selected.
                </p>
                <p class="message">
                    <a href="cart.html">
                        Go back to Cart
                    </a>
                </p>
            `;
            return;
        }

        const selectedCartItemIds = JSON.parse(storedSelectedIds);

        if (!Array.isArray(selectedCartItemIds) || selectedCartItemIds.length === 0) {
            checkoutContainer.innerHTML = `
                <p class="message">
                    No products selected.
                </p>
                <p class="message">
                    <a href="cart.html">
                        Go back to Cart
                    </a>
                </p>
            `;
            return;
        }

        // Get user's cart
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            checkoutContainer.innerHTML = `
                <p class="message">
                    ${data.message || "Unable to load cart"}
                </p>
            `;
            return;
        }

        const cartItems = data.cartItems || data.items || data.cart || [];

        // Filter only selected products
        const selectedItems = cartItems.filter(function (item) {
            return selectedCartItemIds.includes(Number(item.cart_item_id));
        });

        if (selectedItems.length === 0) {
            checkoutContainer.innerHTML = `
                <p class="message">
                    Selected products are no longer available in cart.
                </p>
                <p class="message">
                    <a href="cart.html">
                        Go back to Cart
                    </a>
                </p>
            `;
            return;
        }

        displayCheckout(selectedItems);

    } catch (error) {
        console.error("Checkout error:", error);
        checkoutContainer.innerHTML = `
            <p class="message">
                Unable to connect to server
            </p>
        `;
    }
}

// ========================= DISPLAY CHECKOUT =========================

function displayCheckout(cartItems) {
    checkoutContainer.innerHTML = "";

    if (!cartItems || cartItems.length === 0) {
        checkoutContainer.innerHTML = `
            <p class="message">
                No products selected.
            </p>
            <p class="message">
                <a href="cart.html">
                    Go back to Cart
                </a>
            </p>
        `;
        return;
    }

    let totalAmount = 0;
    let itemsHTML = "";

    cartItems.forEach(function (item) {
        const subtotal = Number(item.subtotal);
        totalAmount += subtotal;

        itemsHTML += `
            <div class="checkout-item">
                <div>
                    <p class="checkout-item-name">
                        ${item.name}
                    </p>
                    <p class="checkout-item-details">
                        ₹${Number(item.price).toFixed(2)} × ${item.quantity}
                    </p>
                </div>
                <p class="checkout-item-price">
                    ₹${subtotal.toFixed(2)}
                </p>
            </div>
        `;
    });

    checkoutContainer.innerHTML = `
        <div class="checkout-card">
            <h2>
                Selected Products
            </h2>
            ${itemsHTML}

            <div class="checkout-total">
                Total: ₹${totalAmount.toFixed(2)}
            </div>

            <!-- DELIVERY ADDRESS -->
            <div class="address-section">
                <h2>
                    Delivery Address
                </h2>

                <div class="form-group">
                    <label for="fullName">
                        Full Name
                    </label>
                    <input type="text" id="fullName" placeholder="Enter full name">
                </div>

                <div class="form-group">
                    <label for="phone">
                        Phone Number
                    </label>
                    <input type="text" id="phone" placeholder="Enter phone number">
                </div>

                <div class="form-group">
                    <label for="address">
                        Address
                    </label>
                    <textarea id="address" placeholder="House No., Street, Area"></textarea>
                </div>

                <div class="form-group">
                    <label for="city">
                        City
                    </label>
                    <input type="text" id="city" placeholder="Enter city">
                </div>

                <div class="form-group">
                    <label for="state">
                        State
                    </label>
                    <input type="text" id="state" placeholder="Enter state">
                </div>

                <div class="form-group">
                    <label for="pincode">
                        Pincode
                    </label>
                    <input type="text" id="pincode" placeholder="Enter pincode">
                </div>
            </div>

            <button id="placeOrderBtn" class="place-order-btn">
                Place Order
            </button>

            <p id="orderMessage"></p>
        </div>
    `;

    document.getElementById("placeOrderBtn").addEventListener("click", placeOrder);
}

// ========================= PLACE ORDER =========================

async function placeOrder() {
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const orderMessage = document.getElementById("orderMessage");

    // Get selected cart item IDs
    const storedSelectedIds = sessionStorage.getItem("selectedCartItemIds");

    if (!storedSelectedIds) {
        orderMessage.textContent = "No products selected.";
        return;
    }

    const selectedCartItemIds = JSON.parse(storedSelectedIds);

    if (!Array.isArray(selectedCartItemIds) || selectedCartItemIds.length === 0) {
        orderMessage.textContent = "No products selected.";
        return;
    }

    // Get address values
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const pincode = document.getElementById("pincode").value.trim();

    // Validate address
    if (!fullName || !phone || !address || !city || !state || !pincode) {
        orderMessage.textContent = "Please fill all delivery address fields.";
        return;
    }

    const confirmOrder = confirm("Are you sure you want to place this order?");

    if (!confirmOrder) {
        return;
    }

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Placing Order...";
    orderMessage.textContent = "";

    try {
        const response = await fetch(`${API_BASE_URL}/orders/place`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: fullName,
                phone: phone,
                address: address,
                city: city,
                state: state,
                pincode: pincode,
                selectedCartItemIds: selectedCartItemIds
            })
        });

        const data = await response.json();

        if (!response.ok) {
            orderMessage.textContent = data.message || "Unable to place order";
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";
            return;
        }

        // Order successful
        orderMessage.textContent = "Order placed successfully!";

        // Clear selected items from session
        sessionStorage.removeItem("selectedCartItemIds");

        setTimeout(function () {
            window.location.href = "orders.html";
        }, 1500);

    } catch (error) {
        console.error("Place order error:", error);
        orderMessage.textContent = "Unable to connect to server";
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Place Order";
    }
}

// ========================= LOGOUT =========================

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("selectedCartItemIds");
        window.location.href = "login.html";
    });
}