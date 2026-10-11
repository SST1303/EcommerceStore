const ordersContainer = document.getElementById("ordersContainer");
const logoutBtn = document.getElementById("logoutBtn");
const token = localStorage.getItem("token");

// CHECK LOGIN
if (!token) {
    window.location.href = "login.html";
} else {
    loadOrders();
}

// GET USER ORDERS
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        console.log("Orders response:", data);

        console.log("First order item:", data.orders?.[0]);

        if (!response.ok) {
            ordersContainer.innerHTML = `
                <p class="message">
                    ${data.message || "Unable to load orders"}
                </p>
            `;
            return;
        }

        const orders = data.orders || [];
        displayOrders(orders);

    } catch (error) {
        console.error("Load orders error:", error);

        ordersContainer.innerHTML = ` <p class="message">Unable to connect to server</p> ` ;
    }
}

// FORMAT PRICE
function formatPrice(price) {
    return Number(price || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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

// DISPLAY ORDERS
function displayOrders(rows) {
    ordersContainer.innerHTML = "";

    if (!rows || rows.length === 0) {
        ordersContainer.innerHTML = `<p class="message">You have no orders yet.</p>`;
        return;
    }

    // GROUP PRODUCTS BY ORDER ID
    const ordersMap = new Map();

    rows.forEach((row) => {
        if (!ordersMap.has(row.id)) {
            ordersMap.set(row.id, {
                id: row.id,
                total_amount: row.total_amount,
                status: row.status,
                created_at: row.created_at,
                items: []
            });
        }

        if (row.order_item_id !== null && row.order_item_id !== undefined) {
            ordersMap.get(row.id).items.push(row);
        }
    });

    // DISPLAY EACH ORDER
    ordersMap.forEach((order) => {
        const orderCard = document.createElement("div");
        orderCard.className = "order-card";

        const status = String(order.status || "PLACED").toUpperCase();
        const statusClass = status.toLowerCase().replaceAll("_", "-");

        // CLICKABLE PRODUCT IMAGE AND NAME
        const productHTML = order.items.map((item) => {
            const imageURL = item.image_url
                ? `${API_BASE_URL.replace(/\/api\/?$/, "")}/images/products/${encodeURIComponent(item.image_url.split("/").pop())}`
                : "";

            const productId = Number(item.product_id);
            const productLink = `order_details.html?id=${Number(order.id)}`;

            const imageHTML = imageURL
                ? `<a href="${productLink}" class="order-product-link">
                        <img class="order-product-image"
                             src="${escapeHTML(imageURL)}"
                             alt="${escapeHTML(item.product_name || "Product")}"
                             onerror="this.style.display='none'">
                   </a>`
                : `<a href="${productLink}" class="order-product-link">
                        <div class="order-product-placeholder">No Image</div>
                   </a>`;

            return `
                <div class="order-product">
                    ${imageHTML}
                    <div class="order-product-info">
                        <h4>
                            <a href="${productLink}" class="order-product-name">
                                ${escapeHTML(item.product_name || "Product unavailable")}
                            </a>
                        </h4>
                        <p>Price: ₹${formatPrice(item.product_price)}</p>
                        <p>Quantity: ${Number(item.quantity)}</p>
                        <p>Subtotal: ₹${formatPrice(item.subtotal)}</p>
                    </div>
                </div>
            `;
        }).join("");

        // CANCEL BUTTON
        let cancelButton = "";

        if (status === "PLACED" || status === "CONFIRMED") {
            cancelButton = `
                <button class="cancel-order-btn" onclick="cancelOrder(${Number(order.id)})">
                    Cancel Order
                </button>
            `;
        }

        // ORDER CARD
        orderCard.innerHTML = `
            <div class="order-info">
                <div class="order-header">
                    <h3>Order #${Number(order.id)}</h3>
                    <span class="order-status status-${statusClass}">
                        ${escapeHTML(status.replaceAll("_", " "))}
                    </span>
                </div>

                <p class="order-date">Placed on: ${formatOrderDate(order.created_at)}</p>

                <div class="order-products">
                    ${productHTML || "<p>Product details unavailable.</p>"}
                </div>

                <div class="order-total">
                    <strong>Total Amount: ₹${formatPrice(order.total_amount)}</strong>
                </div>
            </div>

            <div class="order-actions">
                ${cancelButton}
            </div>
        `;

        ordersContainer.appendChild(orderCard);
    });
}

// ESCAPE HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
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

// CANCEL ORDER
async function cancelOrder(orderId) {
    const confirmCancel = confirm("Are you sure you want to cancel this order?");

    if (!confirmCancel) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/orders/${orderId}/cancel`,
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
            return;
        }

        alert("Order cancelled successfully");
        loadOrders();

    } catch (error) {
        console.error("Cancel order error:", error);
        alert("Unable to connect to server");
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