const ordersContainer = document.getElementById("ordersContainer");
const adminToken = localStorage.getItem("token");

// LOAD ALL ORDERS
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/admin/all`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        });

        const data = await response.json();
        console.log("Admin orders response:", data);

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
        console.error("Load admin orders error:", error);
        ordersContainer.innerHTML = `
            <p class="message">
                Unable to connect to server
            </p>
        `;
    }
}

// DISPLAY ORDERS
function displayOrders(orders) {
    ordersContainer.innerHTML = "";

    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = `
            <p class="message">
                No orders found.
            </p>
        `;
        return;
    }

    orders.forEach(function (order) {
        const orderCard = document.createElement("div");
        orderCard.className = "admin-order-card";

        const orderDate = new Date(order.created_at).toLocaleString();

        orderCard.innerHTML = `
            <div class="admin-order-info">
                <h3>Order #${order.id}</h3>
                <p>Customer ID: ${order.user_id}</p>
                <p>Total: ₹${Number(order.total_amount).toFixed(2)}</p>
                <p>Date: ${orderDate}</p>
                <p>Current Status: <strong>${order.status}</strong></p>
            </div>

            <div class="admin-order-actions">
                <button
                    class="view-admin-order-btn"
                    onclick="viewAdminOrder(${order.id})"
                >
                    View Details
                </button>

                <select class="status-select" id="status-${order.id}">
                    <option value="PLACED" ${order.status === "PLACED" ? "selected" : ""}>PLACED</option>
                    <option value="CONFIRMED" ${order.status === "CONFIRMED" ? "selected" : ""}>CONFIRMED</option>
                    <option value="SHIPPED" ${order.status === "SHIPPED" ? "selected" : ""}>SHIPPED</option>
                    <option value="OUT_FOR_DELIVERY" ${order.status === "OUT_FOR_DELIVERY" ? "selected" : ""}>OUT FOR DELIVERY</option>
                    <option value="DELIVERED" ${order.status === "DELIVERED" ? "selected" : ""}>DELIVERED</option>
                    <option value="CANCELLED" ${order.status === "CANCELLED" ? "selected" : ""}>CANCELLED</option>
                </select>

                <button
                    class="update-status-btn"
                    onclick="updateOrderStatus(${order.id})"
                >
                    Update Status
                </button>
            </div>
        `;

        ordersContainer.appendChild(orderCard);
    });
}

// VIEW ORDER DETAILS
function viewAdminOrder(orderId) {
    window.location.href = `../order_details.html?id=${orderId}`;
}

// UPDATE ORDER STATUS
async function updateOrderStatus(orderId) {
    const statusSelect = document.getElementById(`status-${orderId}`);
    const status = statusSelect.value;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/admin/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                status: status
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to update order status");
            return;
        }

        alert("Order status updated successfully");
        loadOrders();

    } catch (error) {
        console.error("Update order status error:", error);
        alert("Unable to connect to server");
    }
}

// LOAD ORDERS
loadOrders();