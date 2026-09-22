const loginForm = document.getElementById("loginForm");

const registerForm = document.getElementById("registerForm");

const message = document.getElementById("message");


// ========================= LOGIN =========================

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        message.textContent = "Logging in...";

        try {

            const response = await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {
                message.textContent = data.message || "Login failed";
                return;
            }


            // Save JWT token
            localStorage.setItem(
                "token",
                data.token
            );


            // Save user information
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user) );
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


// ========================= REGISTER =========================

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        message.textContent = "Registering...";

        try {

            const response = await fetch(
                `${API_BASE_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || "Registration failed";
                return;
            }

            message.textContent = "Registration successful!";

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1000);

        } catch (error) {

            console.error("Registration error:", error );

            message.textContent = "Unable to connect to server";

        }
    });
}