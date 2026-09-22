const ordersContainer = document.getElementById("ordersContainer");

const logoutBtn = document.getElementById("logoutBtn");

// CHECK LOGIN

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
} else {

    loadOrders();
}

// GET USER ORDERS

async function loadOrders() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders/my-orders`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data = await response.json();

        console.log("Orders response:", data);

        if (!response.ok) {

            ordersContainer.innerHTML =
                `
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

        ordersContainer.innerHTML =
            `
            <p class="message"> Unable to connect to server </p>
            `;
    }
}


// DISPLAY ORDERS

function displayOrders(orders) {

    ordersContainer.innerHTML = "";

    if (
        !orders ||
        orders.length === 0
    ) {

        ordersContainer.innerHTML =
            `
            <p class="message"> You have no orders yet. </p>
            `;

        return;
    }

    orders.forEach(
        function (order) {

            const orderCard = document.createElement("div");

            orderCard.className = "order-card";

            const orderDate = new Date(order.created_at).toLocaleString();

            orderCard.innerHTML =
                `
                <div class="order-info">

                    <h3> Order #${order.id} </h3>

                    <p>
                        Total:
                        ₹${Number(
                            order.total_amount
                        ).toFixed(2)}
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${order.status}
                        </strong>
                    </p>

                    <p>
                        Date:
                        ${orderDate}
                    </p>

                </div>

                <button
                    class="view-order-btn"
                    onclick="viewOrder(
                        ${order.id}
                    )"
                >
                    View Details
                </button>
                `;


            ordersContainer.appendChild(orderCard);
        }
    );
}


// VIEW ORDER DETAILS

function viewOrder(orderId) {

    window.location.href = `order_details.html?id=${orderId}`;
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

