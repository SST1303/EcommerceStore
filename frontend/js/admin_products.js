const productsContainer = document.getElementById("productsContainer");
const adminToken = localStorage.getItem("token");

// LOAD PRODUCTS
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();

    if (!response.ok) {
      productsContainer.innerHTML = `
        <p class="message">
          ${data.message || "Unable to load products"}
        </p>
      `;
      return;
    }

    const products = Array.isArray(data) ? data : data.products || [];
    displayProducts(products);
  } catch (error) {
    console.error("Load products error:", error);
    productsContainer.innerHTML = `
      <p class="message">
        Unable to connect to server
      </p>
    `;
  }
}

// DISPLAY PRODUCTS
function displayProducts(products) {
  productsContainer.innerHTML = "";

  if (!products || products.length === 0) {
    productsContainer.innerHTML = `
      <p class="message">No products found.</p>
    `;
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "admin-product-card";

    const image = product.image_url
      ? `../images/products/${product.image_url}`
      : "../images/products/default.jpg";

    card.innerHTML = `
      <img
        src="${image}"
        alt="${product.name}"
        class="admin-product-image"
        onerror="this.src='../images/products/default.jpg'"
      >
      <div class="admin-product-info">
        <h3>${product.name}</h3>
        <p>${product.description || ""}</p>
        <p>Price: ₹${Number(product.price).toFixed(2)}</p>
        <p>Stock: ${product.stock}</p>
        <p>Category: ${product.category_name || product.category_id || "N/A"}</p>
        <div class="admin-product-actions">
          <button class="edit-product-btn" onclick="editProduct(${product.id})">
            Edit
          </button>
          <button class="delete-product-btn" onclick="deleteProduct(${product.id})">
            Delete
          </button>
        </div>
      </div>
    `;

    productsContainer.appendChild(card);
  });
}

// EDIT PRODUCT
function editProduct(productId) {
  window.location.href = `edit_product.html?id=${productId}`;
}

// DELETE PRODUCT
async function deleteProduct(productId) {
  const confirmDelete = confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Unable to delete product");
      return;
    }

    alert("Product deleted successfully");
    loadProducts();
  } catch (error) {
    console.error("Delete product error:", error);
    alert("Unable to connect to server");
  }
}

// INITIAL CALL
loadProducts();