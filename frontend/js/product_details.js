const productDetails = document.getElementById("productDetails");

const logoutBtn = document.getElementById("logoutBtn");

// Get product ID from URL

const urlParams = new URLSearchParams(window.location.search);

const productId = urlParams.get("id");

// Check Product ID

if (!productId) {

    productDetails.innerHTML = `
        <p class="message">
            Product ID not found
        </p>
    `;

} else {

    loadProduct();

}

// Load Product

async function loadProduct() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/products/${productId}`
        );

        const data = await response.json();

        console.log("Product response:", data);

        if (!response.ok) {

            productDetails.innerHTML = `
                <p class="message">
                    ${data.message || "Product not found"}
                </p>
            `;

            return;
        }

        // API directly returns product object

        const product = data;

        displayProduct(product);

    } catch (error) {

        console.error("Product details error:", error);

        productDetails.innerHTML = `
            <p class="message">
                Unable to connect to server
            </p>
        `;
    }
}


// Display Product

function displayProduct(product) {

    const image =
        product.image_url
            ? `images/products/${product.image_url}`
            : "images/products/default.jpg";

    const outOfStock = Number(product.stock) <= 0;

    productDetails.innerHTML = `

        <div class="product-details-card">

            <div>

                <img
                    src="${image}"
                    alt="${product.name}"
                    class="product-details-image"
                >

            </div>


            <div class="product-details-content">

                <h1> ${product.name} </h1>

                <p class="product-details-description">
                    ${product.description || "No description available."}
                </p>

                <p class="product-details-price">
                    ₹${Number(product.price).toFixed(2)}
                </p>

                <p class="product-details-stock">
                    Stock: ${product.stock}
                </p>

                <div class="quantity-container">

                    <label for="quantity">
                        Quantity
                    </label>

                    <input
                        type="number"
                        id="quantity"
                        value="1"
                        min="1"
                        max="${product.stock}"
                        ${outOfStock ? "disabled" : ""}
                    >

                </div>

                <button
                    class="add-cart-btn"
                    id="addCartBtn"
                    ${outOfStock ? "disabled" : ""}
                >

                    ${
                        outOfStock
                            ? "Out of Stock"
                            : "Add to Cart"
                    }

                </button>

                <p id="cartMessage"></p>

            </div>

        </div>

    `;


    // Add to Cart button

    if (!outOfStock) {

        document
            .getElementById("addCartBtn")
            .addEventListener(
                "click",
                function () {

                    addToCart(product.id);

                }
            );
    }

}


// Add Product to Cart

async function addToCart(productId) {

    const token = localStorage.getItem("token");


    if (!token) {

        document.getElementById("cartMessage").textContent = "Please login first.";

        return;
    }

    const quantity = Number(document.getElementById("quantity").value);

    if (quantity < 1) {

        document.getElementById("cartMessage").textContent = "Quantity must be at least 1.";

        return;
    }

    const cartMessage = document.getElementById("cartMessage");

    cartMessage.textContent = "Adding to cart...";

    try {

        const response = await fetch(
            `${API_BASE_URL}/cart`,
            {
                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({

                    product_id: productId,

                    quantity: quantity

                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            cartMessage.textContent = data.message || "Unable to add to cart";
            return;
        }

        cartMessage.textContent = "Product added to cart successfully!";

    } catch (error) {

        console.error("Add to cart error:", error);

        cartMessage.textContent = "Unable to connect to server";
    }
}


// Logout

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