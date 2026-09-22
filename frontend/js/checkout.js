const checkoutContainer = document.getElementById("checkoutContainer");

const logoutBtn = document.getElementById("logoutBtn");

const token = localStorage.getItem("token");

// ========================= CHECK LOGIN =========================

if (!token) {
    window.location.href = "login.html";
} else {
    loadCheckout();
}

// ========================= LOAD CART =========================

async function loadCheckout() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/cart`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            checkoutContainer.innerHTML =
                `<p class="message">
                    ${data.message || "Unable to load cart"}
                </p>`;

            return;
        }

        const cartItems = data.cartItems || data.items || data.cart || [];

        displayCheckout(cartItems);

    } catch (error) {

        console.error("Checkout error:", error);

        checkoutContainer.innerHTML =
            `<p class="message">
                Unable to connect to server
            </p>`;

    }
}

// ========================= DISPLAY CHECKOUT =========================

function displayCheckout(cartItems) {

    checkoutContainer.innerHTML = "";

    if (!cartItems || cartItems.length === 0) {

        checkoutContainer.innerHTML = `

            <p class="message">
                Your cart is empty.
            </p>

            <p class="message">
                <a href="index.html">
                    Continue Shopping
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
                        ₹${Number(item.price).toFixed(2)}
                        ×
                        ${item.quantity}
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

            ${itemsHTML}

            <div class="checkout-total">
                Total:
                ₹${totalAmount.toFixed(2)}
            </div>

            <button
                id="placeOrderBtn"
                class="place-order-btn"
            >
                Place Order
            </button>

            <p id="orderMessage"></p>

        </div>

    `;

    document
        .getElementById("placeOrderBtn")
        .addEventListener(
            "click",
            placeOrder
        );

}

// ========================= PLACE ORDER =========================

async function placeOrder() {

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const orderMessage = document.getElementById("orderMessage");

    const confirmOrder = confirm("Are you sure you want to place this order?");

    if (!confirmOrder) {
        return;
    }

    placeOrderBtn.disabled = true;

    placeOrderBtn.textContent = "Placing Order...";

    orderMessage.textContent = "";

    try {

        const response = await fetch(
            `${API_BASE_URL}/orders/place`,
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            orderMessage.textContent = data.message || "Unable to place order";

            placeOrderBtn.disabled = false;

            placeOrderBtn.textContent = "Place Order";

            return;
        }

        orderMessage.textContent = "Order placed successfully!";

        /* Backend returns: orderId, totalAmount, status */

        setTimeout(function () {
            window.location.href ="orders.html";
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

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "login.html";

        }
    );
}