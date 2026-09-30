// ========================= For Admin to show Admin Dashboard =========================
// Navbar Login / Logout / Admin Dashboard link visibility based on user role

document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const adminDashboardLink = document.getElementById("adminDashboardLink");
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");

    // Hide Admin Dashboard by default
    if (adminDashboardLink) {
        adminDashboardLink.style.display = "none";
    }

    // User is logged in
    if (user) {
        // Show Logout
        if (logoutBtn) {
            logoutBtn.style.display = "inline-block";
        }

        // Hide Login
        if (loginLink) {
            loginLink.style.display = "none";
        }

        // Show Admin Dashboard only for Admin
        if (user.role && user.role.toUpperCase() === "ADMIN") {
            if (adminDashboardLink) {
                adminDashboardLink.style.display = "inline-block";
            }
        }
    } else {
        // User is not logged in - Show Login
        if (loginLink) {
            loginLink.style.display = "inline-block";
        }

        // Hide Logout
        if (logoutBtn) {
            logoutBtn.style.display = "none";
        }
    }
});

// ========================= Normal user =========================

const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");
let allProducts = [];
let wishlistProductIds = [];
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

// ========================= LOAD WISHLIST STATUS =========================

async function loadWishlistStatus() {
    const token = localStorage.getItem("token");

    // User is not logged in
    if (!token) {
        wishlistProductIds = [];
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return;
        }

        const wishlist = data.wishlist || [];
        wishlistProductIds = wishlist.map(function (item) {
            return Number(item.product_id);
        });
    } catch (error) {
        console.error("Load wishlist status error:", error);
    }
}

// ========================= GET ALL PRODUCTS =========================

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();

        if (!response.ok) {
            productsContainer.innerHTML = `
                <p class="message">
                    Failed to load products
                </p>`;
            return;
        }

        /*
          Backend response may be:
          [ {...}, {...} ]
          OR
          { products: [...] }
        */
       
        if (Array.isArray(data)) {
            allProducts = data;
        } else {
            allProducts = data.products || [];
        }

        // Load wishlist status before displaying products
        await loadWishlistStatus();
        displayProducts(allProducts);
    } catch (error) {
        console.error("Load products error:", error);
        productsContainer.innerHTML = `
            <p class="message">
                Unable to connect to server
            </p>`;
    }
}

// ========================= DISPLAY PRODUCTS =========================

function displayProducts(products) {
    productsContainer.innerHTML = "";

    if (!products || products.length === 0) {
        productsContainer.innerHTML = `
            <p class="message">
                No products found
            </p>`;
        return;
    }

    products.forEach(function (product) {
        const card = document.createElement("div");
        card.className = "product-card";

        const image = product.image_url
            ? `images/products/${product.image_url}`
            : "images/products/default.jpg";

        card.innerHTML = `
            <div class="product-image-container">
                <img
                    src="${image}"
                    alt="${product.name}"
                    class="product-image"
                >
                <button
                    class="wishlist-heart"
                    onclick="toggleWishlist(${product.id}, event)"
                    title="Add to Wishlist"
                >
                    <svg
                        viewBox="0 0 24 24"
                        class="heart-svg ${wishlistProductIds.includes(Number(product.id)) ? "heart-filled" : "heart-empty"}"
                    >
                        <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                        ></path>
                    </svg>
                </button>
            </div>
            <div class="product-content">
                <h3>${product.name}</h3>
                <p class="product-description">
                    ${product.description || ""}
                </p>
                <p class="product-price">
                    ₹${Number(product.price).toFixed(2)}
                </p>
                <p class="product-stock">
                    Stock: ${product.stock}
                </p>
                <button
                    class="view-details-btn"
                    onclick="viewProduct(${product.id})"
                >
                    View Details
                </button>
            </div>
        `;

        productsContainer.appendChild(card);
    });
}

// ========================= SEARCH FILTER AND SORT PRODUCTS =========================

function filterAndSortProducts() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortFilter.value;

    // COPY PRODUCTS
    let filteredProducts = [...allProducts];

    // SEARCH FILTER
    if (searchText) {
        filteredProducts = filteredProducts.filter(function (product) {
            return (
                product.name.toLowerCase().includes(searchText) ||
                (product.description || "").toLowerCase().includes(searchText)
            );
        });
    }

    // CATEGORY FILTER
    if (selectedCategory !== "all") {
        filteredProducts = filteredProducts.filter(function (product) {
            return product.category_name === selectedCategory;
        });
    }

    // PRICE SORT
    if (selectedSort === "priceLowHigh") {
        filteredProducts.sort(function (a, b) {
            return Number(a.price) - Number(b.price);
        });
    }

    if (selectedSort === "priceHighLow") {
        filteredProducts.sort(function (a, b) {
            return Number(b.price) - Number(a.price);
        });
    }

    displayProducts(filteredProducts);
}

// ========================= GET CURRENT FILTERED PRODUCTS =========================

function getCurrentFilteredProducts() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortFilter.value;

    // COPY PRODUCTS
    let filteredProducts = [...allProducts];

    // SEARCH FILTER
    if (searchText) {
        filteredProducts = filteredProducts.filter(function (product) {
            return (
                product.name.toLowerCase().includes(searchText) ||
                (product.description || "").toLowerCase().includes(searchText)
            );
        });
    }

    // CATEGORY FILTER
    if (selectedCategory !== "all") {
        filteredProducts = filteredProducts.filter(function (product) {
            return product.category_name === selectedCategory;
        });
    }

    // PRICE SORT
    if (selectedSort === "priceLowHigh") {
        filteredProducts.sort(function (a, b) {
            return Number(a.price) - Number(b.price);
        });
    }

    if (selectedSort === "priceHighLow") {
        filteredProducts.sort(function (a, b) {
            return Number(b.price) - Number(a.price);
        });
    }

    return filteredProducts;
}

// SEARCH
searchInput.addEventListener("input", filterAndSortProducts);

// CATEGORY
categoryFilter.addEventListener("change", filterAndSortProducts);

// SORT
sortFilter.addEventListener("change", filterAndSortProducts);

// ========================= TOGGLE WISHLIST =========================

async function toggleWishlist(productId, event) {
    event.stopPropagation();
    const token = localStorage.getItem("token");

    // Login check
    if (!token) {
        alert("Please login to use wishlist.");
        return;
    }

    const productExists = wishlistProductIds.includes(Number(productId));

    try {
        // ================= REMOVE =================
        if (productExists) {
            const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to remove from wishlist");
                return;
            }

            // Remove from local array
            wishlistProductIds = wishlistProductIds.filter(function (id) {
                return id !== Number(productId);
            });
        }
        // ================= ADD =================
        else {
            const response = await fetch(`${API_BASE_URL}/wishlist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to add to wishlist");
                return;
            }

            // Add to local array
            wishlistProductIds.push(Number(productId));
        }

        // Refresh product cards
        displayProducts(getCurrentFilteredProducts());
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        alert("Unable to connect to server");
    }
}

// ========================= VIEW PRODUCT =========================

function viewProduct(productId) {
    window.location.href = `product_details.html?id=${productId}`;
}

// ========================= LOGOUT =========================

logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
});

// LOAD PRODUCTS
loadProducts();