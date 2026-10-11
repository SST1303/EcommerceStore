const orderDetailsContainer = document.getElementById("orderDetailsContainer");
const logoutBtn = document.getElementById("logoutBtn");
const token = localStorage.getItem("token");

// GET ORDER ID FROM URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("id");

// CHECK LOGIN AND ORDER ID
if (!token) {
    window.location.href = "login.html";
} else if (!orderId || !/^\d+$/.test(orderId) || Number(orderId) <= 0) {
    orderDetailsContainer.innerHTML = `
        <p class="message">Invalid Order ID. Please open order details from My Orders.</p>
    `;
} else {
    loadOrderDetails();
}

// FORMAT PRICE
function formatPrice(price) {
    const amount = Number(price);

    return (Number.isFinite(amount) ? amount : 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ESCAPE HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// FORMAT DATE
function formatOrderDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// GET ORDER DETAILS
async function loadOrderDetails() {
    orderDetailsContainer.innerHTML = `
        <p class="message">Loading order details...</p>
    `;

    try {
        const response = await fetch(
            `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log("Order details response:", data);

        if (!response.ok) {
            orderDetailsContainer.innerHTML = `
                <p class="message">
                    ${escapeHTML(data.message || "Unable to load order details")}
                </p>
            `;
            return;
        }

        if (!data.order) {
            orderDetailsContainer.innerHTML = `
                <p class="message">Order details not found.</p>
            `;
            return;
        }

        displayOrderDetails(data.order, data.items);

    } catch (error) {
        console.error("Order details error:", error);

        orderDetailsContainer.innerHTML = `
            <p class="message">
                Unable to connect to server. Please check your connection and try again.
            </p>
        `;
    }
}

// DISPLAY ORDER DETAILS
function displayOrderDetails(order, items) {
    let itemsHTML = "";

    if (Array.isArray(items) && items.length > 0) {
        itemsHTML = items.map(function (item) {
            const productName = escapeHTML(
                item.name || item.product_name || "Product unavailable"
            );

            const itemPrice = Number(item.price ?? item.product_price ?? 0);
            const quantity = Number(item.quantity) || 0;
            const subtotal = Number(
                item.subtotal ?? itemPrice * quantity
            );

            // GET PRODUCT IMAGE PATH
            const imageFile = String(item.image_url || "")
                .replace(/\\/g, "/")
                .split("/")
                .pop();

            const imageUrl = imageFile
                ? `images/products/${encodeURIComponent(imageFile)}`
                : "images/products/default-product.png";

            return `
                <div class="order-item">
                    <div class="order-item-image">
                        <img
                            src="${imageUrl}"
                            alt="${productName}"
                            class="ordered-product-image"
                            onerror="this.onerror=null; this.src='images/products/default-product.png';"
                        >
                    </div>

                    <div class="order-item-info">
                        <h3>${productName}</h3>
                        <p>Price: ₹${formatPrice(itemPrice)}</p>
                        <p>Quantity: ${quantity}</p>
                    </div>

                    <div class="order-item-subtotal">
                        ₹${formatPrice(subtotal)}
                    </div>
                </div>
            `;
        }).join("");
    } else {
        itemsHTML = `
            <p class="message">No products found for this order.</p>
        `;
    }

    // ORDER STATUS
    const status = String(order.status || "PLACED").toUpperCase();
    const statusClass = status.toLowerCase().replace(/_/g, "-");

    // CANCEL BUTTON
    let cancelButtonHTML = "";

    if (status === "PLACED" || status === "CONFIRMED") {
        cancelButtonHTML = `
            <div class="order-actions">
                <button class="cancel-order-btn" id="cancelOrderBtn">
                    Cancel Order
                </button>
            </div>
        `;
    }

    // DELIVERY ADDRESS
    const fullName = escapeHTML(order.full_name || "Not available");
    const phone = escapeHTML(order.phone || "Not available");
    const address = escapeHTML(order.address || "Not available");
    const city = escapeHTML(order.city || "");
    const state = escapeHTML(order.state || "");
    const pincode = escapeHTML(order.pincode || "");

    const cityState = [city, state].filter(Boolean).join(", ");
    const location = [cityState, pincode].filter(Boolean).join(" - ");

    // DISPLAY ORDER
    orderDetailsContainer.innerHTML = `
        <div class="order-details-card">

            <div class="order-header">
                <div>
                    <h2>Order #${Number(order.id)}</h2>
                    <p>Date: ${formatOrderDate(order.created_at)}</p>
                </div>

                <div class="order-status status-${escapeHTML(statusClass)}">
                    Status:
                    <strong>${escapeHTML(status.replace(/_/g, " "))}</strong>
                </div>
            </div>

            <div class="delivery-address">
                <h2>Delivery Address</h2>

                <p>
                    <strong>${fullName}</strong><br>
                    ${phone}<br>
                    ${address}<br>
                    ${location || "Location not available"}
                </p>
            </div>

            <div class="order-items">
                <h2>Ordered Products</h2>
                ${itemsHTML}
            </div>

            <div class="order-total">
                <strong>Total: ₹${formatPrice(order.total_amount)}</strong>
            </div>

            ${cancelButtonHTML}

        </div>
    `;

    // CANCEL BUTTON EVENT
    const cancelOrderBtn = document.getElementById("cancelOrderBtn");

    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener("click", cancelOrder);
    }
}

// CANCEL ORDER
async function cancelOrder() {
    const confirmCancel = confirm(
        "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) {
        return;
    }

    const cancelOrderBtn = document.getElementById("cancelOrderBtn");

    if (cancelOrderBtn) {
        cancelOrderBtn.disabled = true;
        cancelOrderBtn.textContent = "Cancelling...";
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/cancel`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to cancel order");
            await loadOrderDetails();
            return;
        }

        alert(data.message || "Order cancelled successfully");

        // REFRESH ORDER DETAILS
        await loadOrderDetails();

    } catch (error) {
        console.error("Cancel order error:", error);
        alert("Unable to connect to server.");
        await loadOrderDetails();
    }
}

// LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}