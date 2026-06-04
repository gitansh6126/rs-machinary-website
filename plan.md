

RS Machinery

Goal:

Convert the existing static website into a dynamic product management system using Google Apps Script and Google Sheets while keeping the current website design intact.

==================================================
TECH STACK
==========

Frontend:

* HTML
* CSS
* Vanilla JavaScript

Backend:

* Google Apps Script

Database:

* Google Sheets

Hosting:

* Hostinger

Repository:

* Single GitHub Repository

Do NOT use:

* React
* Vue
* Angular
* Next.js
* Nuxt
* Astro
* Node.js
* Express
* MongoDB
* PostgreSQL
* Firebase
* Docker

==================================================
REPOSITORY STRUCTURE
====================

rs-machinary-website/

website/
admin/
apps-script/

==================================================
PUBLIC WEBSITE
==============

Keep existing branding.

Keep existing design.

Keep existing color palette.

Keep existing typography.

Keep existing hero section.

Keep existing layout.

Only add required functionality.

Create:

website/index.html
website/products.html
website/product.html

Create:

website/js/api.js
website/js/app.js

Modify:

website/styles.css

Features:

1. Dynamic Product Loading
2. Product Listing Page
3. Product Detail Page
4. Category Filters
5. Product Search
6. WhatsApp Inquiry Button
7. Inquiry Form
8. Pagination

Hero slider remains static.

==================================================
ADMIN PORTAL
============

Admin URL:

admin.rsmachinery.com

Create:

admin/index.html
admin/products.html
admin/product-form.html
admin/categories.html
admin/inquiries.html
admin/settings.html

Create:

admin/css/admin.css
admin/js/admin.js

Features:

Login

Product CRUD

Category CRUD

Inquiry Management

Settings Management

Responsive Design

Use same visual identity as public website.

==================================================
DATABASE
========

Google Sheet Tabs:

1. Products

Columns:

id
name
slug
category_id
seo_title
seo_description
short_description
description
image
gallery_images
specifications
variations
featured
active
sort_order
created_at
updated_at

2. Categories

Columns:

id
name
slug
description
image
active
sort_order
created_at
updated_at

3. Settings

Columns:

key
value

Required rows:

admin_password_hash
admin_key
site_name
phone
whatsapp
email
address

4. Inquiries

Columns:

id
date
name
phone
product
message
status

==================================================
AUTHENTICATION
==============

DO NOT store password in browser storage.

Login Flow:

1. User enters password.
2. Apps Script validates password hash.
3. Apps Script returns admin_key.
4. Store admin_key in sessionStorage.
5. All future requests use admin_key.

Example:

sessionStorage.setItem(
"admin_key",
returnedKey
);

Password must never be stored.

Password must never be sent repeatedly.

==================================================
APPS SCRIPT
===========

Create a SINGLE FILE:

Code.gs

Implement:

login

getProducts
getProduct
getCategories

addProduct
updateProduct
deleteProduct

addCategory
updateCategory
deleteCategory

getDashboard

getInquiries

addInquiry

Use GET and POST only.

No PUT.

No DELETE.

All responses:

{
success: true,
data: ...
}

==================================================
IMAGE MANAGEMENT
================

Version 1:

No image uploader.

Admin manually pastes image URLs.

Example:

https://rsmachinery.com/uploads/product.webp

==================================================
PRODUCT REQUIREMENTS
====================

Slug auto-generated.

Example:

Heavy Duty Monkey Crane

becomes

heavy-duty-monkey-crane

Variations stored as JSON inside Products sheet.

Specifications stored as JSON.

==================================================
SEARCH
======

Server-side search.

Server-side category filtering.

Pagination:

20 products per page.

==================================================
INQUIRIES
=========

Public inquiry form.

Stores inquiries into Google Sheet.

Admin can view inquiries.

==================================================
SECURITY
========

Use HTTPS.

Use admin_key validation.

Never expose password hash.

Never expose Settings sheet values except public values.

Sanitize all user input.

==================================================
SCALABILITY
===========

Must support:

500 products

50 categories

without architecture changes.

==================================================
OUTPUT FORMAT
=============

Generate code in this order:

1. Google Sheet Setup
2. Apps Script Code.gs
3. Public Website Changes
4. Admin Portal Files
5. Deployment Instructions
6. Hostinger Setup
7. Subdomain Setup

Write production-ready code.

Include comments throughout the code.

Do not skip files.

Build the complete working system.
