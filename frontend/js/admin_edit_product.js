const editProductForm = document.getElementById("editProductForm");
const formMessage = document.getElementById("formMessage");

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
const adminToken = localStorage.getItem("token");

if (!productId) {
    formMessage.textContent = "Product ID not found.";
} else {
    loadProduct();
}

// LOAD PRODUCT
async function loadProduct() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();

        if (!response.ok) {
            formMessage.textContent = data.message || "Unable to load product.";
            return;
        }

        document.getElementById("name").value = data.name || "";
        document.getElementById("description").value = data.description || "";
        document.getElementById("price").value = data.price || "";
        document.getElementById("stock").value = data.stock || "";
        document.getElementById("image_url").value = data.image_url || "";
        document.getElementById("category_id").value = data.category_id || "";

    } catch (error) {
        console.error("Load product error:", error);
        formMessage.textContent = "Unable to connect to server.";
    }
}

// UPDATE PRODUCT
editProductForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = Number(document.getElementById("price").value);
    const stock = Number(document.getElementById("stock").value);
    const image_url = document.getElementById("image_url").value.trim();
    const category_id = document.getElementById("category_id").value;

    formMessage.textContent = "Updating product...";

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: name,
                description: description,
                price: price,
                stock: stock,
                image_url: image_url,
                category_id: category_id ? Number(category_id) : null
            })
        });

        const data = await response.json();

        if (!response.ok) {
            formMessage.textContent = data.message || "Unable to update product.";
            return;
        }

        formMessage.textContent = "Product updated successfully!";

        setTimeout(function () {
            window.location.href = "products.html";
        }, 1000);

    } catch (error) {
        console.error("Update product error:", error);
        formMessage.textContent = "Unable to connect to server.";
    }
});

