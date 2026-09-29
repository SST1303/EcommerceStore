const orderDetailsContainer = document.getElementById("orderDetailsContainer");
const logoutBtn = document.getElementById("logoutBtn");
const adminToken = localStorage.getItem("token");


// CHECK LOGIN

if (!adminToken) {
    window.location.href = "../login.html";
}


// GET ORDER ID FROM URL

const urlParams = new URLSearchParams(window.location.search);

const orderId = urlParams.get("id");


if (!orderId) {

    orderDetailsContainer.innerHTML = `
        <p class="message">
            Order ID not found.
        </p>
    `;

} else {

    loadAdminOrderDetails();

}


// GET ADMIN ORDER DETAILS

async function loadAdminOrderDetails() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/orders/admin/${orderId}`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${adminToken}`
                }
            }
        );


        const data = await response.json();

        console.log("Admin order details:", data);


        if (!response.ok) {

            orderDetailsContainer.innerHTML = `
                <p class="message">
                    ${data.message ||
                    "Unable to load order details"}
                </p>
            `;

            return;
        }

        displayOrderDetails(data.order, data.items);

    } catch (error) {

        console.error("Admin order details error:", error);

        orderDetailsContainer.innerHTML = `
            <p class="message">
                Unable to connect to server
            </p>
        `;

    }

}


// DISPLAY ORDER DETAILS

function displayOrderDetails(order, items) {

    let itemsHTML = "";

    items.forEach(function (item) {

        itemsHTML += `
            <div class="order-item">

                <div class="order-item-info">

                    <h3> ${item.name} </h3>

                    <p> Price: ₹${Number(item.price).toFixed(2)} </p>

                    <p> Quantity: ${item.quantity} </p>

                </div>


                <div class="order-item-subtotal">
                    ₹${Number(item.subtotal).toFixed(2)}
                </div>

            </div>
        `;

    });


    const orderDate = new Date(order.created_at) .toLocaleString();

    orderDetailsContainer.innerHTML = `

        <div class="order-details-card">

            <!-- ORDER HEADER -->

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


            <!-- CUSTOMER INFORMATION -->

            <div class="delivery-address">

                <h2> Customer Information </h2>

                <p>

                    <strong> Name: </strong>
                    ${order.user_name}

                    <br>

                    <strong> Email: </strong>
                    ${order.email}

                </p>

            </div>


            <!-- DELIVERY ADDRESS -->

            <div class="delivery-address">

                <h2> Delivery Address </h2>

                <p>

                    <strong> ${order.full_name} </strong>

                    <br>

                    ${order.phone}

                    <br>

                    ${order.address}

                    <br>

                    ${order.city},
                    ${order.state}
                    -
                    ${order.pincode}

                </p>

            </div>


            <!-- ORDERED PRODUCTS -->

            <div class="order-items">

                <h2> Ordered Products </h2>

                ${itemsHTML}

            </div>


            <!-- TOTAL -->

            <div class="order-total">

                Total:
                ₹${Number(order.total_amount).toFixed(2)}

            </div>

        </div>

    `;

}


// LOGOUT

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "../login.html";

        }
    );

}