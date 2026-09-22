# EcommerceStore - E-Commerce Web Application

EcommerceStore is a full-stack e-commerce web application developed using Node.js, Express.js, MySQL, HTML, CSS, and JavaScript.

The application allows users to register, log in, browse products, manage their shopping cart, place orders, and view order details. It also provides an admin module for managing products and orders.

## Features

### User Features

* User Registration
* User Login
* JWT-based Authentication
* Browse Products
* View Product Details
* Add Products to Cart
* Update Cart Quantity
* Remove Products from Cart
* Checkout
* Place Orders
* View Orders
* View Order Details
* Logout

### Admin Features

* Admin Login
* Admin Dashboard
* Add Products
* View Products
* Update Products
* Delete Products
* View Orders
* Update Order Status

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API
* LocalStorage

### Backend

* Node.js
* Express.js
* JWT
* CORS
* dotenv

### Database

* MySQL

### API Testing

* Postman

## Project Structure

```text
EcommerceStore
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend
    ├── admin
    ├── css
    ├── images
    ├── js
    ├── index.html
    ├── login.html
    ├── register.html
    ├── product_details.html
    ├── cart.html
    ├── checkout.html
    ├── orders.html
    └── order_details.html
```

## Database

The application uses MySQL as the database.

### Main Tables

* `users`
* `categories`
* `products`
* `cart`
* `cart_items`
* `orders`
* `order_items`

### Product Categories

* Electronics
* Clothing
* Shoes
* Beauty
* Books

## Authentication

The application uses JWT-based authentication.

The authentication process works as follows:

1. User registers an account.
2. User logs in using email and password.
3. Backend verifies the credentials.
4. A JWT token is generated.
5. The token is stored in LocalStorage.
6. The token is sent with protected API requests.
7. Authentication middleware verifies the token.
8. Authorized users can access protected resources.

Role-based authorization is used to provide separate access for users and administrators.

## Order Status

Orders can have the following statuses:

```text
PLACED
CONFIRMED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

## API

Backend URL:

```text
http://localhost:5000
```

API Base URL:

```text
http://localhost:5000/api
```

Example:

```http
GET /api/products
```

The frontend communicates with the backend using the JavaScript Fetch API.

## How to Run

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MySQL
* Visual Studio Code
* Postman
* Live Server extension for VS Code

### Backend Setup

Clone the repository:

```bash
git clone https://github.com/SST1303/EcommerceStore.git
```

Navigate to the project:

```bash
cd EcommerceStore
```

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
JWT_SECRET=your_secret_key
```

Create the MySQL database:

```sql
CREATE DATABASE ecommerce_db;
```

Make sure MySQL is running.

Start the backend:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

### Frontend Setup

Open the `frontend` folder in Visual Studio Code.

Open:

```text
frontend/index.html
```

Right-click on `index.html` and select:

```text
Open with Live Server
```

The frontend will usually open at:

```text
http://localhost:5500
```

The exact port may vary depending on the Live Server configuration.

## Application Flow

```text
User
  ↓
Register / Login
  ↓
Browse Products
  ↓
View Product Details
  ↓
Add to Cart
  ↓
Checkout
  ↓
Place Order
  ↓
View Orders
  ↓
View Order Details
```

## Admin Flow

```text
Admin Login
    ↓
Admin Dashboard
    ↓
Manage Products
    ├── Add Product
    ├── View Products
    ├── Update Product
    └── Delete Product
    ↓
Manage Orders
    └── Update Order Status
```

## Security

* JWT-based authentication
* Protected API routes
* Authentication middleware
* Role-based authorization
* Environment variables for sensitive configuration

> Do not upload the `.env` file to GitHub because it may contain sensitive credentials.

## Future Enhancements

* Online Payment Gateway
* Product Search and Filtering
* Product Reviews and Ratings
* Wishlist
* Pagination
* Image Upload
* Email Notifications
* Responsive Mobile Design
* Cloud Deployment

## Author

**Shraddha Thorat**

* GitHub: [SST1303](https://github.com/SST1303)
