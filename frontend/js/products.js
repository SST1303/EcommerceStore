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

        if (
            user.role &&
            user.role.toUpperCase() === "ADMIN"
        ) {

            if (adminDashboardLink) {
                adminDashboardLink.style.display = "inline-block";
            }

        }

    }


    // User is not logged in

    else {

        // Show Login

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


// ========================= GET ALL PRODUCTS =========================

async function loadProducts() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/products`
        );


        const data = await response.json();


        if (!response.ok) {

            productsContainer.innerHTML =
                `<p class="message">
                    Failed to load products
                </p>`;

            return;
        }


        /*
         Backend response may be:
         [
             {...},
             {...}
         ]

         OR

         {
             products: [...]
         }
        */

        if (Array.isArray(data)) {
            allProducts = data;
        }
        else {
            allProducts = data.products || [];
        }

        displayProducts(allProducts);


    } catch (error) {

        console.error("Load products error:", error);


        productsContainer.innerHTML =
            `<p class="message">
                Unable to connect to server
            </p>`;

    }
}



// ========================= DISPLAY PRODUCTS =========================

function displayProducts(products) {

    productsContainer.innerHTML = "";


    if (!products || products.length === 0) {

        productsContainer.innerHTML =
            `<p class="message">
                No products found
            </p>`;

        return;
    }


    products.forEach(function (product) {

        const card =
            document.createElement("div");

        card.className =
            "product-card";


        const image =
            product.image_url
                ? `images/products/${product.image_url}`
                : "images/products/default.jpg";


        card.innerHTML = `

            <img
                src="${image}"
                alt="${product.name}"
                class="product-image"
            >

            <div class="product-content">

                <h3>
                    ${product.name}
                </h3>

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

// ========================= SEARCH PRODUCTS =========================

searchInput.addEventListener(
    "input",
    function () {

        const searchText = searchInput.value
            .toLowerCase()
            .trim();


        const filteredProducts = allProducts.filter(function (product) {

            return product.name
                .toLowerCase()
                .includes(searchText);

        });

        displayProducts(filteredProducts);

    }
);

// ========================= VIEW PRODUCT =========================

function viewProduct(productId) {

    window.location.href =
        `product_details.html?id=${productId}`;

}



// ========================= LOGOUT =========================

logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";

    }
);


loadProducts();  // LOAD PRODUCTS