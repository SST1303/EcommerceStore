const usersTableBody = document.getElementById("usersTableBody");
const messageElement = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");
const searchUser = document.getElementById("searchUser");
const filterRole = document.getElementById("filterRole");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

const token = localStorage.getItem("token");

let currentUserId = null;
let allUsers = [];
let currentPage = 1;
const usersPerPage = 10;

try {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    currentUserId = savedUser ? Number(savedUser.id) : null;
} catch (error) {
    currentUserId = null;
}

// HTML ESCAPING
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// SHOW MESSAGE
function showMessage(message, isError = false) {
    messageElement.textContent = message;
    messageElement.style.color = isError ? "red" : "green";
}

// DISPLAY USERS
function displayUsers(users) {
    const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage));

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = users.slice(
        startIndex,
        startIndex + usersPerPage
    );

    if (paginatedUsers.length === 0) {
        usersTableBody.innerHTML =
            '<tr><td colspan="5">No matching users found.</td></tr>';
    } else {
        usersTableBody.innerHTML = paginatedUsers.map((user) => {
            const isCurrentUser = Number(user.id) === currentUserId;

            return `
                <tr>
                    <td>${escapeHTML(user.id)}</td>
                    <td>${escapeHTML(user.name)}</td>
                    <td>${escapeHTML(user.email)}</td>
                    <td>${escapeHTML(user.role)}</td>
                    <td>
                        <select
                            id="role-${Number(user.id)}"
                            ${isCurrentUser ? "disabled" : ""}
                        >
                            <option value="USER"
                                ${user.role === "USER" ? "selected" : ""}>
                                USER
                            </option>
                            <option value="ADMIN"
                                ${user.role === "ADMIN" ? "selected" : ""}>
                                ADMIN
                            </option>
                        </select>

                        <button
                            type="button"
                            onclick="updateRole(${Number(user.id)})"
                            ${isCurrentUser ? "disabled" : ""}
                        >
                            Update
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// SEARCH AND FILTER USERS
function filterUsers() {
    const searchText = searchUser.value.trim().toLowerCase();
    const selectedRole = filterRole.value;

    const filteredUsers = allUsers.filter((user) => {
        const name = String(user.name || "").toLowerCase();
        const email = String(user.email || "").toLowerCase();

        const matchesSearch =
            name.includes(searchText) ||
            email.includes(searchText);

        const matchesRole =
            selectedRole === "ALL" || user.role === selectedRole;

        return matchesSearch && matchesRole;
    });

    currentPage = 1;
    displayUsers(filteredUsers);
}

// LOAD USERS
async function loadUsers() {
    if (!token) {
        showMessage("Please login first.", true);
        usersTableBody.innerHTML = "";
        return;
    }

    try {
        usersTableBody.innerHTML =
            '<tr><td colspan="5">Loading users...</td></tr>';

        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load users");
        }

        if (!Array.isArray(data.users)) {
            throw new Error("Invalid users data received from server");
        }

        allUsers = data.users;
        filterUsers();

    } catch (error) {
        showMessage(error.message, true);
        usersTableBody.innerHTML =
            '<tr><td colspan="5">Unable to load users.</td></tr>';
        pageInfo.textContent = "Page 1 of 1";
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
    }
}

// UPDATE USER ROLE
async function updateRole(userId) {
    const roleSelect = document.getElementById(`role-${userId}`);

    if (!roleSelect || !token) {
        showMessage("Unable to update user role.", true);
        return;
    }

    const newRole = roleSelect.value;

    const confirmed = confirm(
        `Are you sure you want to change this user's role to ${newRole}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/${userId}/role`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    role: newRole
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update role");
        }

        showMessage(data.message);
        await loadUsers();

    } catch (error) {
        showMessage(error.message, true);
    }
}

// SEARCH EVENT
searchUser.addEventListener("input", filterUsers);

// ROLE FILTER EVENT
filterRole.addEventListener("change", filterUsers);

// PREVIOUS PAGE
prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        filterUsersWithoutReset();
    }
});

// NEXT PAGE
nextPageBtn.addEventListener("click", () => {
    const filteredUsers = getFilteredUsers();
    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / usersPerPage)
    );

    if (currentPage < totalPages) {
        currentPage++;
        displayUsers(filteredUsers);
    }
});

// GET FILTERED USERS
function getFilteredUsers() {
    const searchText = searchUser.value.trim().toLowerCase();
    const selectedRole = filterRole.value;

    return allUsers.filter((user) => {
        const name = String(user.name || "").toLowerCase();
        const email = String(user.email || "").toLowerCase();

        return (
            (name.includes(searchText) || email.includes(searchText)) &&
            (selectedRole === "ALL" || user.role === selectedRole)
        );
    });
}

// CHANGE PAGE WITHOUT RESET
function filterUsersWithoutReset() {
    displayUsers(getFilteredUsers());
}

// LOGOUT
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../login.html";
});

// INITIALIZE
loadUsers();
