const orderDetailsContainer = document.getElementById("orderDetailsContainer");
const logoutBtn = document.getElementById("logoutBtn");

// CHECK LOGIN

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

// GET ORDER ID FROM URL

const urlParams = new URLSearchParams(window.location.search);

const orderId = urlParams.get("id");

if (!orderId) {

    orderDetailsContainer.innerHTML = ` <p class="message"> Order ID not found. </p> `;

} else {

    loadOrderDetails();

}

// GET ORDER DETAILS

async function loadOrderDetails() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders/${orderId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data = await response.json();

        console.log("Order details response:", data);

        if (!response.ok) {

            orderDetailsContainer.innerHTML =
                `
                <p class="message">
                    ${data.message || "Unable to load order details"}
                </p>
                `;

            return;
        }

        displayOrderDetails(data.order, data.items);

    } catch (error) {

        console.error("Order details error:", error);

        orderDetailsContainer.innerHTML =
            `
            <p class="message">
                Unable to connect to server
            </p>
            `;
    }
}


// DISPLAY ORDER DETAILS

function displayOrderDetails(order, items) {

    // Check if order data exists
    if (!order) {
        orderDetailsContainer.innerHTML = `
            <p class="message">
                Order details not found.
            </p>
        `;
        return;
    }

    let itemsHTML = "";

    if (items && items.length > 0) {

        items.forEach(function (item) {

            itemsHTML +=
                `
            <div class="order-item">

                <div class="order-item-info">

                    <h3>${item.name}</h3>

                    <p> Price: ₹${Number(item.price).toFixed(2)} </p>

                    <p> Quantity: ${item.quantity} </p>

                </div>

                <div class="order-item-subtotal">
                    ₹${Number(item.subtotal).toFixed(2)}
                </div>

            </div>
            `;
        });

    } else {

        itemsHTML = ` <p class="message"> No products found for this order. </p> `;
    }

    let cancelButtonHTML = "";

    if (
        order.status === "PLACED" ||
        order.status === "CONFIRMED"
    ) {
        cancelButtonHTML = `
        <div class="order-actions">
            <button
                class="cancel-order-btn"
                id="cancelOrderBtn">
                Cancel Order
            </button>
        </div>
    `;
    }

    const orderDate = new Date(order.created_at).toLocaleString();

    orderDetailsContainer.innerHTML =
        `
        <div class="order-details-card">

            <div class="order-header">

                <div>

                    <h2> Order #${order.id} </h2>

                    <p> Date: ${orderDate} </p>

                </div>


                <div class="order-status">

                    Status:
                    <strong> ${order.status} </strong>

                </div>

            </div>

            <div class="delivery-address">

                <h2> Delivery Address </h2>

                <p>
                    <strong>${order.full_name}</strong><br>
                    ${order.phone}<br>
                    ${order.address}<br>
                    ${order.city}, ${order.state} - ${order.pincode}
                </p>

            </div>

            <div class="order-items">

                <h2> Ordered Products </h2>

                ${itemsHTML}

            </div>

            <div class="order-total">

                Total:
                ₹${Number(order.total_amount).toFixed(2)}

            </div>

            ${cancelButtonHTML}

        </div>
        `;

    const cancelOrderBtn = document.getElementById("cancelOrderBtn");

    if (cancelOrderBtn) {

        cancelOrderBtn.addEventListener("click", cancelOrder);
    }
}

async function cancelOrder() {

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

        loadOrderDetails();

    } catch (error) {

        console.error("Cancel order error:", error);

        alert("Unable to connect to server");
    }
}


// LOGOUT

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

