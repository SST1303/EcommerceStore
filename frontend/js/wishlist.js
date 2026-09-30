const wishlistContainer = document.getElementById("wishlistContainer"); 
const logoutBtn = document.getElementById("logoutBtn"); 
 
const token = localStorage.getItem("token"); 
 
// Login check 
if (!token) { 
    window.location.href = "login.html"; 
} 
 
 
// Load Wishlist 
async function loadWishlist() { 
    try { 
        const response = await fetch( 
            `${API_BASE_URL}/wishlist`, 
            { 
                method: "GET", 
                headers: { 
                    "Authorization": `Bearer ${token}` 
                } 
            } 
        ); 
 
        const data = await response.json(); 
 
        console.log("Wishlist response:", data); 
 
        if (!response.ok) { 
            wishlistContainer.innerHTML = ` 
                <p class="message"> 
                    ${data.message || "Unable to load wishlist"} 
                </p> 
            `; 
            return; 
        } 
 
        const wishlist = data.wishlist || []; 
 
        console.log("Wishlist array before display:", JSON.stringify(wishlist, null, 2)); 
 
        displayWishlist(wishlist); 
 
    } catch (error) { 
 
        console.error("Load wishlist error:", error); 
 
        wishlistContainer.innerHTML = ` 
            <p class="message"> 
                Unable to connect to server 
            </p> 
        `; 
    } 
} 
 
 
// Display Wishlist 
function displayWishlist(wishlist) { 
 
    console.log("Displaying wishlist:", wishlist); 
 
    wishlistContainer.innerHTML = ""; 
 
    if (!wishlist || wishlist.length === 0) { 
        wishlistContainer.innerHTML = ` 
            <p class="message"> 
                Your wishlist is empty. 
            </p> 
        `; 
        return; 
    } 
 
    wishlist.forEach(function (product) { 
 
        const card = document.createElement("div"); 
        card.className = "product-card"; 
 
        const image = product.image_url 
            ? `images/products/${product.image_url}` 
            : "images/products/default.jpg"; 
 
        card.innerHTML = ` 
            <div class="product-image-container" onclick="viewProduct(${product.product_id})"> 
 
                <img 
                    src="${image}" 
                    alt="${product.name}" 
                    class="product-image" 
                > 
 
                <button 
                    class="wishlist-heart" 
                    onclick="removeFromWishlist(${product.product_id}, event)" 
                    aria-label="Remove from wishlist" 
                > 
                    <svg 
                        class="heart-svg" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg" 
                    > 
                        <path 
                            class="heart-filled" 
                            d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" 
                        /> 
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
 
                <p> 
                    Category: ${product.category_name || "Not available"} 
                </p> 
 
            </div> 
        `; 
 
        wishlistContainer.appendChild(card); 
    }); 
} 
 
 
// View Product 
function viewProduct(productId) { 
 
    window.location.href = `product_details.html?id=${productId}`; 
} 
 
 
// Remove from Wishlist 
async function removeFromWishlist(productId, event) { 
 
    event.stopPropagation(); 
 
    try { 
 
        const response = await fetch( 
            `${API_BASE_URL}/wishlist/${productId}`, 
            { 
                method: "DELETE", 
 
                headers: { 
                    "Authorization": `Bearer ${token}` 
                } 
            } 
        ); 
 
        const data = await response.json(); 
 
        if (!response.ok) { 
 
            alert(data.message || "Unable to remove product from wishlist"); 
 
            return; 
        } 
 
        loadWishlist(); 
 
    } catch (error) { 
 
        console.error("Remove wishlist error:", error); 
 
        alert("Unable to connect to server"); 
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
 
 
// Load wishlist when page opens 
loadWishlist();

