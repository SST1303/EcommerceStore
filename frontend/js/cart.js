const cartContainer = document.getElementById("cartContainer");

const cartSummary = document.getElementById("cartSummary");

const logoutBtn = document.getElementById("logoutBtn");

// ========================= CHECK LOGIN =========================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
} else {
    loadCart();
}


// ========================= GET CART =========================

async function loadCart() {

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

            cartContainer.innerHTML =
                `<p class="message">
                    ${data.message || "Unable to load cart"}
                </p>`;

            return;
        }

        const cartItems = data.cartItems || data.items || data.cart || [];

        displayCart(cartItems);

    } catch (error) {

        console.error("Load cart error:", error);

        cartContainer.innerHTML =
            `<p class="message">
                Unable to connect to server
            </p>`;

    }

}


// ========================= DISPLAY CART =========================

function displayCart(cartItems) {

    cartContainer.innerHTML = "";
    cartSummary.innerHTML = "";

    if (!cartItems || cartItems.length === 0) {

        cartContainer.innerHTML =
            `<p class="message">
                Your cart is empty.
            </p>`;

        return;
    }

    let totalAmount = 0;

    cartItems.forEach(function (item) {

        const subtotal = Number(item.subtotal);

        totalAmount += subtotal;

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `

            <div class="cart-item-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    Price:
                    ₹${Number(item.price).toFixed(2)}
                </p>

                <p>
                    Quantity:
                    ${item.quantity}
                </p>

            </div>


            <div class="cart-item-price">
                ₹${subtotal.toFixed(2)}
            </div>

        `;

        cartContainer.appendChild(cartItem);

    });


    cartSummary.innerHTML = `

        <div class="cart-summary">

            <p class="cart-total">
                Total:
                ₹${totalAmount.toFixed(2)}
            </p>

            <div class="cart-buttons">
                <button
                    class="clear-cart-btn"
                    id="clearCartBtn"
                >
                    Clear Cart
                </button>

                <button
                    class="checkout-btn"
                    id="checkoutBtn"
                >
                    Proceed to Checkout
                </button>

            </div>
        </div>

    `;

    document
        .getElementById("clearCartBtn")
        .addEventListener(
            "click",
            clearCart
        );


    document
        .getElementById("checkoutBtn")
        .addEventListener(
            "click",
            function () {

                window.location.href = "checkout.html";

            }
        );
}

// ========================= CLEAR CART =========================

async function clearCart() {

    const confirmClear = confirm("Are you sure you want to clear your cart?");

    if (!confirmClear) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/cart/`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to clear cart");
            return;
        }

        alert("Cart cleared successfully");

        loadCart();

    } catch (error) {

        console.error("Clear cart error:", error);

        alert("Unable to connect to server");

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