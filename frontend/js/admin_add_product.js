const addProductForm = document.getElementById("addProductForm");
const formMessage = document.getElementById("formMessage");

addProductForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Form inputs
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = Number(document.getElementById("price").value);
    const stock = Number(document.getElementById("stock").value);
    const image_url = document.getElementById("image_url").value.trim();
    const category_id = document.getElementById("category_id").value;

    const token = localStorage.getItem("token");

    formMessage.textContent = "Adding product...";

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
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
            formMessage.textContent = data.message || "Unable to add product";
            return;
        }

        formMessage.textContent = "Product added successfully!";
        addProductForm.reset();

    } catch (error) {
        console.error("Add product error:", error);
        formMessage.textContent = "Unable to connect to server";
    }
});

