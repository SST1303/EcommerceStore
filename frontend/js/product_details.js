const productDetails = document.getElementById("productDetails");
const logoutBtn = document.getElementById("logoutBtn");

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Wishlist status
let isProductInWishlist = false;


// =================== CHECK PRODUCT ID ===================

if (!productId) {

    productDetails.innerHTML = ` <p class="message"> Product ID not found </p> `;

} else {

    loadProduct();

}


// =================== LOAD PRODUCT ===================

async function loadProduct() {

    try {

        const response = await fetch(`${API_BASE_URL}/products/${productId}`);

        const data = await response.json();

        if (!response.ok) {

            productDetails.innerHTML = ` <p class="message"> ${data.message || "Product not found"} </p> `;

            return;
        }

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


// =================== DISPLAY PRODUCT ===================

function displayProduct(product) {

    const image =
        product.image_url
            ? `images/products/${product.image_url}`
            : "images/products/default.jpg";

    const outOfStock = Number(product.stock) <= 0;

    productDetails.innerHTML = `

        <div class="product-details-card">

            <div class="product-image-section">

                <img
                    src="${image}"
                    alt="${product.name}"
                    class="product-details-image"
                > 

                <div class="product-image-actions">

                    <button
                        class="image-action"
                        id="wishlistBtn"
                        title="Wishlist"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            class="details-heart heart-not-added"
                        >

                            <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                            ></path>

                        </svg>

                        <span id="wishlistText"> Wishlist </span>

                    </button>

                    <button
                        class="image-action"
                        id="shareBtn"
                        title="Share Product"
                    >

                        <span class="share-icon"> ↗ </span>

                        <span> Share </span>

                    </button>

                </div>

            </div>

            <div class="product-details-content">

                <h1> ${product.name} </h1>

                <p class="product-details-description">

                    ${product.description ||
                    "No description available."}

                </p>

                <p class="product-details-category">

                    Category:
                    ${product.category_name ||
                    "Not available"}

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

                    ${outOfStock
                            ? "Out of Stock"
                            : "Add to Cart"
                    }

                </button>

                <p id="cartMessage"></p>

                <p id="wishlistMessage"></p>

            </div>

        </div>

    `;


    // =================== ADD TO CART ===================

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


    // =================== WISHLIST TOGGLE ===================

    document
        .getElementById("wishlistBtn")
        .addEventListener(
            "click",
            function () {

                toggleWishlist(product.id);

            }
        );


    document
        .getElementById("shareBtn")
        .addEventListener(
            "click",
            function () {

                shareProduct(product.name);

            }
        );


    // =================== CHECK WISHLIST STATUS ===================

    checkWishlistStatus(product.id);

}


// =================== ADD TO CART ===================

async function addToCart(productId) {

    const token = localStorage.getItem("token");

    const cartMessage = document.getElementById("cartMessage");

    if (!token) {

        cartMessage.textContent = "Please login first.";

        return;
    }

    const quantityInput = document.getElementById("quantity");

    const quantity = Number(quantityInput.value);

    if (quantity < 1) {

        cartMessage.textContent = "Quantity must be at least 1.";

        return;
    }

    cartMessage.textContent = "Adding to cart...";

    try {

        const response =
            await fetch(
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


// =================== WISHLIST TOGGLE ===================

async function toggleWishlist(productId) {

    const token = localStorage.getItem("token");

    const wishlistMessage = document.getElementById("wishlistMessage");

    const wishlistText = document.getElementById("wishlistText");

    const heart = document.querySelector(".details-heart");

    if (!token) {

        if (wishlistMessage) {

            wishlistMessage.textContent = "Please login first to use wishlist.";

        }

        return;
    }

    try {

        if (isProductInWishlist) {

            const response =
                await fetch(
                    `${API_BASE_URL}/wishlist/${productId}`,
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

                if (wishlistMessage) {

                    wishlistMessage.textContent = data.message || "Unable to remove from wishlist";

                }

                return;
            }

            isProductInWishlist = false;

            if (heart) {

                heart.classList.remove("heart-added");

                heart.classList.add("heart-not-added");

            }

            if (wishlistText) {
                wishlistText.textContent = "Wishlist";
            }

            if (wishlistMessage) {
                wishlistMessage.textContent = "";
            }

        }

        else {

            const response =
                await fetch(
                    `${API_BASE_URL}/wishlist`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            product_id: productId

                        })
                    }
                );

            const data = await response.json();

            if (!response.ok) {

                if (wishlistMessage) {

                    wishlistMessage.textContent = data.message || "Unable to add product to wishlist";

                }

                return;
            }

            isProductInWishlist = true;

            if (heart) {

                heart.classList.remove("heart-not-added");

                heart.classList.add("heart-added");

            }

            if (wishlistText) {
                wishlistText.textContent = "Wishlist";
            }

            if (wishlistMessage) {
                wishlistMessage.textContent = "";
            }

        }

    } catch (error) {

        console.error("Wishlist error:", error);

        if (wishlistMessage) {

            wishlistMessage.textContent = "Unable to connect to server";

        }
    }
}


// =================== CHECK WISHLIST STATUS ===================

async function checkWishlistStatus(productId) {

    const token = localStorage.getItem("token");

    if (!token) {

        return;

    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/wishlist`,
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

            return;

        }

        const wishlist = data.wishlist || [];

        isProductInWishlist =
            wishlist.some(
                function (item) {

                    return (Number(item.product_id) === Number(productId));

                }
            );

        const heart = document.querySelector(".details-heart");

        const wishlistText = document.getElementById("wishlistText");

        if (isProductInWishlist) {

            if (heart) {

                heart.classList.remove("heart-not-added");

                heart.classList.add("heart-added");

            }

            if (wishlistText) {

                wishlistText.textContent = "Wishlist";

            }

        }

        else {

            if (heart) {

                heart.classList.remove("heart-added");

                heart.classList.add("heart-not-added");

            }

            if (wishlistText) {

                wishlistText.textContent = "Wishlist";

            }

        }

    } catch (error) {

        console.error("Check wishlist status error:", error);
    }
}


// =================== SHARE PRODUCT ===================

function shareProduct(productName) {

    const shareData = {

        title: productName,

        text: `Check out this product: ${productName}`,

        url: window.location.href

    };

    if (navigator.share) {

        navigator
            .share(shareData)
            .catch(
                function (error) {

                    console.log("Share canceled", error);

                }
            );

    }

    else {

        navigator
            .clipboard
            .writeText(window.location.href)
            .then(
                function () {

                    alert("Product link copied to clipboard!");

                }
            )
            .catch(
                function () {

                    alert("Failed to copy link.");

                }
            );

    }
}


// =================== LOGOUT ===================

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

