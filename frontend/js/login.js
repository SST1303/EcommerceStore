const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// ========================= SHOW / HIDE PASSWORD =========================

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
        const isPasswordHidden = passwordInput.type === "password";

        passwordInput.type = isPasswordHidden ? "text" : "password";

        togglePassword.setAttribute(
            "aria-label",
            isPasswordHidden ? "Hide password" : "Show password"
        );

        eyeIcon.innerHTML = isPasswordHidden
            ? '<path d="M3 3l18 18"></path><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.9"></path><path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"></path>'
            : '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>';
    });
}

// ========================= LOGIN =========================

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = passwordInput.value;

        message.textContent = "Logging in...";

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || "Login failed";
                return;
            }

            // Save JWT token
            localStorage.setItem("token", data.token);

            // Save user information
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            message.textContent = "Login successful!";

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);

        } catch (error) {
            console.error("Login error:", error);
            message.textContent = "Unable to connect to server";
        }
    });
}
