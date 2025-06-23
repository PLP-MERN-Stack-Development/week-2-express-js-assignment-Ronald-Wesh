# 📦 Product API – Express.js Beginner Project

This is a beginner-friendly RESTful API built with **Express.js**. It lets you manage a list of products (like adding, updating, deleting, and viewing them). It uses in-memory data (no database needed).

##  How to Run

1. Make sure you have **Node.js** installed.
2. Clone the repo or download the project.
3. Open the terminal and run:

```bash
npm install
node server.js
Open Postman or your browser and visit:

arduino
Copy
Edit
http://localhost:3000
 API Endpoints
Method	Endpoint	Description
GET	/api/products	List all products
GET	/api/products/:id	Get product by ID
POST	/api/products	Add a new product
PUT	/api/products/:id	Update an existing product
DELETE	/api/products/:id	Delete a product
GET	/api/products/stats	Show product count by category

Add header:

makefile
Copy
Edit
x-api-key: 12345