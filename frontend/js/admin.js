// CHECK LOGIN

const token = localStorage.getItem("token");

const userData = localStorage.getItem("user");

if (!token || !userData) {
    window.location.href = "../login.html";
}

// GET USER DATA

const user = JSON.parse(userData);

// CHECK ADMIN ROLE

if (user.role !== "ADMIN") {

    alert("Access denied. Admin only.");

    window.location.href = "../index.html";

}

// LOGOUT

const logoutBtn = document.getElementById("logoutBtn");

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

