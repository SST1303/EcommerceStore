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
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            cartContainer.innerHTML = `
                <p class="message">
                    ${data.message || "Unable to load cart"}
                </p>
            `;
            return;
        }

        const cartItems = data.cartItems || data.items || data.cart || [];

        displayCart(cartItems);

    } catch (error) {
        console.error("Load cart error:", error);

        cartContainer.innerHTML = `
            <p class="message">
                Unable to connect to server
            </p>
        `;
    }
}

// ========================= DISPLAY CART =========================

function displayCart(cartItems) {
    cartContainer.innerHTML = "";
    cartSummary.innerHTML = "";

    if (!cartItems || cartItems.length === 0) {
        cartContainer.innerHTML = `
            <p class="message">
                Your cart is empty.
            </p>
        `;
        return;
    }

    cartItems.forEach(function (item) {
        const subtotal = Number(item.subtotal);

        const image = item.image_url
            ? `images/products/${item.image_url}`
            : "images/products/default.jpg";

        // Wrapper for product + buttons
        const productWrapper = document.createElement("div");
        productWrapper.className = "cart-product-wrapper";

        // Product card
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <img
                src="${image}"
                alt="${item.name}"
                class="cart-item-image"
            >

            <div class="cart-item-info">
                <h3>
                    ${item.name}
                </h3>
                <p>
                    Price: ₹${Number(item.price).toFixed(2)}
                </p>

                <div class="cart-quantity">
                    <span>Quantity:</span>

                    <button 
                        class="quantity-btn decrease-btn"
                        type="button"
                    >
                        -
                    </button>

                    <span class="quantity-value">
                        ${item.quantity}
                    </span>

                    <button 
                        class="quantity-btn increase-btn"
                        type="button"
                    >
                        +
                    </button>
                </div>
            </div>

            <div class="cart-item-price">
                ₹${subtotal.toFixed(2)}
            </div>
        `;

        // Quantity decrease button
        cartItem
            .querySelector(".decrease-btn")
            .addEventListener("click", function (event) {
                event.stopPropagation();

                const currentQuantity = Number(item.quantity);

                if (currentQuantity <= 1) {
                    return;
                }

                updateCartQuantity(
                    item.product_id,
                    currentQuantity - 1
                );
            });

        // Quantity increase button
        cartItem
            .querySelector(".increase-btn")
            .addEventListener("click", function (event) {
                event.stopPropagation();

                const currentQuantity = Number(item.quantity);

                updateCartQuantity(
                    item.product_id,
                    currentQuantity + 1
                );
            });

        // Click product card
        cartItem.addEventListener("click", function () {
            selectProduct(
                productWrapper,
                cartItem,
                item
            );
        });

        // Add card inside wrapper
        productWrapper.appendChild(cartItem);

        // Add wrapper to cart
        cartContainer.appendChild(productWrapper);
    });
}

// ========================= UPDATE CART QUANTITY =========================

async function updateCartQuantity(productId, quantity) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/cart/${productId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantity: quantity
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message || "Unable to update cart quantity"
            );
            return;
        }

        loadCart();

    } catch (error) {
        console.error("Update cart quantity error:", error);

        alert("Unable to connect to server");
    }
}

// ========================= SELECT PRODUCT =========================

function selectProduct(
    productWrapper,
    cartItem,
    item
) {
    // Remove previous selection
    const allWrappers = document.querySelectorAll(".cart-product-wrapper");

    allWrappers.forEach(function (wrapper) {
        const oldCard = wrapper.querySelector(".cart-item");

        if (oldCard) {
            oldCard.classList.remove("selected");
        }

        const oldButtons = wrapper.querySelector(".product-actions");

        if (oldButtons) {
            oldButtons.remove();
        }
    });

    // Select clicked product
    cartItem.classList.add("selected");

    // Create buttons OUTSIDE the card
    const productActions = document.createElement("div");
    productActions.className = "product-actions";

    productActions.innerHTML = `
        <button class="clear-cart-btn" id="productClearCartBtn">
            Clear Cart
        </button>

        <button class="checkout-btn" id="productCheckoutBtn">
            Proceed to Checkout
        </button>
    `;

    // IMPORTANT:
    // Buttons are added AFTER the card, not inside the card.
    productWrapper.appendChild(productActions);

    // Clear Cart
    productActions
        .querySelector("#productClearCartBtn")
        .addEventListener("click", function (event) {
            event.stopPropagation();
            removeCartItem(item.product_id);
        });

    // Checkout
    productActions
        .querySelector("#productCheckoutBtn")
        .addEventListener("click", function (event) {
            event.stopPropagation();
            proceedToCheckout(item);
        });
}

// ========================= PROCEED TO CHECKOUT =========================

function proceedToCheckout(item) {
    const selectedCartItemIds = [
        Number(item.cart_item_id)
    ];

    sessionStorage.setItem(
        "selectedCartItemIds",
        JSON.stringify(selectedCartItemIds)
    );

    window.location.href = "checkout.html";
}

// ========================= CLEAR CART =========================

async function clearCart() {
    const confirmClear = confirm("Are you sure you want to clear your cart?");

    if (!confirmClear) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to clear cart");
            return;
        }

        // Remove selected product
        sessionStorage.removeItem("selectedCartItemIds");

        alert("Cart cleared successfully");

        loadCart();

    } catch (error) {
        console.error("Clear cart error:", error);
        alert("Unable to connect to server");
    }
}


// ========================= REMOVE SINGLE CART ITEM =========================

async function removeCartItem(productId) {
    const confirmRemove = confirm("Are you sure you want to remove this product from cart?");

    if (!confirmRemove) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/cart/${productId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to remove product");
            return;
        }

        sessionStorage.removeItem("selectedCartItemIds");

        alert("Product removed from cart");

        loadCart();

    } catch (error) {
        console.error("Remove cart item error:", error);
        alert("Unable to connect to server");
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
