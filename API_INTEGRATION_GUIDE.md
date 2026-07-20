# Project Overview

This repository exposes a Django REST Framework API under the base path /api. The implementation is currently focused on authentication, users/addresses, categories, products, product images, product variants, and dashboard user management.

## Base URL

- Production or local backend base: /api
- Auth routes are mounted under /api/auth/
- Users routes are mounted under /api/users/
- Categories routes are mounted under /api/categories/
- Products routes are mounted under /api/products/ and /api/product-images/
- Dashboard users are mounted under /api/dashboard/users/

## Authentication Strategy

- Authentication is cookie-based.
- The backend reads the access token from the access cookie.
- The refresh token is used by the refresh and logout endpoints.
- The API does not use bearer tokens in the implemented code.
- The frontend should call these endpoints with credentials enabled.

## Important Implementation Notes

- The project uses CORS for http://localhost:3000 with credentials enabled.
- CSRF middleware is enabled, so browser-based writes may require CSRF handling depending on the frontend origin.
- The implemented permission model is:
  - Auth endpoints: public
  - User/address/profile endpoints: authenticated users only
  - Categories/products/product images: read-only for anyone, write operations for admins/moderators only
  - Dashboard users: admin only
- The app contains models for offers, cart, and orders, but no corresponding views, URLs, or serializers are currently implemented.

## Global Pagination

- Default pagination is enabled for the product and dashboard user viewsets.
- Default page size: 10
- Query parameter: page_size
- Max page size: 100

## Global Filtering and Ordering

Product list endpoints support:
- Filtering by category via category=<id>
- Search by name and description via search=<term>
- Ordering by name, created_at, updated_at via ordering=<field>

---

# Authentication

## Cookie Configuration

The backend sets these cookie names by default:
- access_token
- refresh_token

Cookie behavior:
- HttpOnly: true
- Secure: enabled based on the DEBUG setting
- SameSite: Lax
- Path: /
- Max age: 30 days for both access and refresh cookies

## Register

### Endpoint Information

- HTTP Method: POST
- URL: /api/auth/register/
- Description: Creates a new customer account and immediately sets auth cookies.
- Authentication Required: No
- Required Role: None
- Required Headers: Content-Type: application/json
- Required Cookies: None
- Permissions: AllowAny

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body:
  ```json
  {
    "first_name": "Ahmed",
    "last_name": "Ali",
    "phone": "01012345678",
    "password": "StrongPass123"
  }
  ```
- Required Fields:
  - first_name
  - last_name
  - phone
  - password
- Optional Fields: None
- Data Types:
  - first_name: string
  - last_name: string
  - phone: string
  - password: string
- Validation Rules:
  - password minimum length: 8
  - phone must match Egyptian format: ^01[0125][0-9]{8}$
- Default Values: None
- Nullable Fields: None

### Response

- Success Status Code: 201 Created
- Success Response Example:
  ```json
  {
    "user": {
      "id": 1,
      "first_name": "Ahmed",
      "last_name": "Ali",
      "phone": "01012345678",
      "role": "CUSTOMER"
    }
  }
  ```
- Error Status Codes: 400 Bad Request
- Error Response Examples:
  ```json
  {
    "phone": ["Enter a valid Egyptian phone number."],
    "password": ["Password must be at least 8 characters long."]
  }
  ```

### Business Rules

- The backend always creates the user with role CUSTOMER.
- The frontend must not send role.
- The response body contains only the user payload; the auth tokens are set as cookies.

### cURL Example

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"first_name":"Ahmed","last_name":"Ali","phone":"01012345678","password":"StrongPass123"}'
```

---

## Login

### Endpoint Information

- HTTP Method: POST
- URL: /api/auth/login/
- Description: Authenticates a user and sets auth cookies.
- Authentication Required: No
- Required Role: None
- Required Headers: Content-Type: application/json
- Required Cookies: None
- Permissions: AllowAny

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body:
  ```json
  {
    "phone": "01012345678",
    "password": "StrongPass123"
  }
  ```
- Required Fields:
  - phone
  - password
- Optional Fields: None
- Data Types: string
- Validation Rules:
  - Authentication is performed with phone and password.
  - Invalid credentials raise a validation error.
- Default Values: None
- Nullable Fields: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "user": {
      "id": 1,
      "first_name": "Ahmed",
      "last_name": "Ali",
      "phone": "01012345678",
      "role": "CUSTOMER"
    }
  }
  ```
- Error Status Codes: 400 Bad Request
- Error Response Example:
  ```json
  {
    "non_field_errors": ["Invalid credentials"]
  }
  ```

### Business Rules

- The response body does not include tokens.
- The access and refresh tokens are stored in HttpOnly cookies.

### cURL Example

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"phone":"01012345678","password":"StrongPass123"}'
```

---

## Me

### Endpoint Information

- HTTP Method: GET
- URL: /api/auth/me/
- Description: Returns the authenticated user profile.
- Authentication Required: Yes
- Required Role: None
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "id": 1,
    "first_name": "Ahmed",
    "last_name": "Ali",
    "phone": "01012345678",
    "role": "CUSTOMER"
  }
  ```
- Error Status Codes: 401 Unauthorized

### Business Rules

- This endpoint reads the access token from the cookie via the custom authentication class.

### cURL Example

```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## Logout

### Endpoint Information

- HTTP Method: POST
- URL: /api/auth/logout/
- Description: Clears the auth cookies and blacklists the refresh token if present.
- Authentication Required: No
- Required Role: None
- Required Headers: None
- Required Cookies: refresh_token (optional)
- Permissions: AllowAny

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 204 No Content
- Error Status Codes: None from the implemented code

### Business Rules

- The refresh token is blacklisted if it can be parsed.
- The response clears both auth cookies.

### cURL Example

```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## Refresh

### Endpoint Information

- HTTP Method: POST
- URL: /api/auth/refresh/
- Description: Refreshes the access token using the refresh cookie.
- Authentication Required: No
- Required Role: None
- Required Headers: None
- Required Cookies: refresh_token
- Permissions: AllowAny

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "detail": "Token refreshed."
  }
  ```
- Error Status Codes: 401 Unauthorized
- Error Response Example:
  ```json
  {
    "detail": "Refresh token cookie is missing."
  }
  ```

### Business Rules

- The refresh token is read from the refresh cookie.
- The backend rotates the refresh token and writes updated cookies.

### cURL Example

```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -c cookies.txt \
  -b cookies.txt
```

---

# Users

## Profile Update

### Endpoint Information

- HTTP Method: PUT/PATCH
- URL: /api/users/update_profile/
- Description: Updates the authenticated user profile.
- Authentication Required: Yes
- Required Role: None
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body:
  ```json
  {
    "first_name": "Ahmed",
    "last_name": "Ali"
  }
  ```
- Required Fields: None
- Optional Fields:
  - first_name
  - last_name
- Data Types: string
- Validation Rules: None beyond serializer model field validation
- Default Values: None
- Nullable Fields: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "message": "Profile updated successfully.",
    "data": {
      "first_name": "Ahmed",
      "last_name": "Ali"
    }
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized

### Business Rules

- Only first_name and last_name can be changed.
- This endpoint uses partial updates, so sending only one field is valid.

### cURL Example

```bash
curl -X PUT http://localhost:8000/api/users/update_profile/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"first_name":"Ahmed","last_name":"Ali"}'
```

---

## Delete Profile

### Endpoint Information

- HTTP Method: DELETE
- URL: /api/users/delete_profile/
- Description: Permanently deletes the authenticated user.
- Authentication Required: Yes
- Required Role: None
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "message": "Profile deleted successfully."
  }
  ```
- Error Status Codes: 401 Unauthorized, 404 Not Found

### Business Rules

- The deletion is a hard delete.
- The endpoint uses the current authenticated user ID.

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/users/delete_profile/ \
  -c cookies.txt \
  -b cookies.txt
```

---

# Addresses

## Add Address

### Endpoint Information

- HTTP Method: POST
- URL: /api/users/add_address/
- Description: Creates an address for the authenticated user.
- Authentication Required: Yes
- Required Role: None
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body:
  ```json
  {
    "title": "Home",
    "country": "Egypt",
    "city": "Cairo",
    "street": "Main Street",
    "is_default": true
  }
  ```
- Required Fields:
  - title
  - country
  - city
  - street
- Optional Fields:
  - is_default
- Data Types: string, boolean
- Validation Rules:
  - Duplicate address per user is rejected.
  - Only one default address per user is allowed.
- Default Values:
  - is_default defaults to false when omitted.
- Nullable Fields: None

### Response

- Success Status Code: 201 Created
- Success Response Example:
  ```json
  {
    "message": "Address added successfully.",
    "data": {
      "id": 1,
      "title": "Home",
      "country": "Egypt",
      "city": "Cairo",
      "street": "Main Street",
      "is_default": true
    }
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized
- Error Response Example:
  ```json
  {
    "message": "Failed to add address.",
    "errors": {
      "message": ["This address already exists."]
    }
  }
  ```

### Business Rules

- If a new address is marked as default, all other addresses for the same user are set to non-default.
- If the user has no addresses and no default is provided, the first address becomes the default automatically.
- The backend uses a unique constraint on (user, title, country, city, street).

### cURL Example

```bash
curl -X POST http://localhost:8000/api/users/add_address/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"title":"Home","country":"Egypt","city":"Cairo","street":"Main Street","is_default":true}'
```

---

## List Addresses

### Endpoint Information

- HTTP Method: GET
- URL: /api/users/get_addresses/
- Description: Returns addresses for the authenticated user ordered by default first.
- Authentication Required: Yes
- Required Role: None
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "message": "Addresses retrieved successfully.",
    "data": [
      {
        "id": 1,
        "title": "Home",
        "country": "Egypt",
        "city": "Cairo",
        "street": "Main Street",
        "is_default": true
      }
    ]
  }
  ```
- Error Status Codes: 401 Unauthorized

### Business Rules

- The response is ordered by is_default descending and created_at descending.

### cURL Example

```bash
curl -X GET http://localhost:8000/api/users/get_addresses/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## Get Address by ID

### Endpoint Information

- HTTP Method: GET
- URL: /api/users/get_address_by_id/<address_id>/
- Description: Returns a single address belonging to the authenticated user.
- Authentication Required: Yes
- Required Role: None
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters:
  - address_id: integer
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "message": "Address retrieved successfully.",
    "data": {
      "id": 1,
      "title": "Home",
      "country": "Egypt",
      "city": "Cairo",
      "street": "Main Street",
      "is_default": true
    }
  }
  ```
- Error Status Codes: 401 Unauthorized, 404 Not Found

### cURL Example

```bash
curl -X GET http://localhost:8000/api/users/get_address_by_id/1/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## Update Address

### Endpoint Information

- HTTP Method: PUT/PATCH
- URL: /api/users/update_address/<address_id>/
- Description: Updates an existing address.
- Authentication Required: Yes
- Required Role: None
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters:
  - address_id: integer
- Query Parameters: None
- Request Body:
  ```json
  {
    "title": "Work",
    "is_default": true
  }
  ```
- Required Fields: None
- Optional Fields:
  - title
  - country
  - city
  - street
  - is_default
- Data Types: string, boolean
- Validation Rules:
  - Duplicate address per user is rejected.
  - If is_default is true, the previous default address is changed to false.
- Default Values: None
- Nullable Fields: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "message": "Address updated successfully.",
    "data": {
      "id": 1,
      "title": "Work",
      "country": "Egypt",
      "city": "Cairo",
      "street": "Main Street",
      "is_default": true
    }
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized, 404 Not Found

### Business Rules

- The update is wrapped in a database transaction.
- The field is_default is treated specially; changing it to true will unset all other default addresses for the user.

### cURL Example

```bash
curl -X PUT http://localhost:8000/api/users/update_address/1/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"title":"Work","is_default":true}'
```

---

## Set Default Address

### Endpoint Information

- HTTP Method: PUT
- URL: /api/users/set_default_address/<address_id>/
- Description: Sets an address as the default address for the authenticated user.
- Authentication Required: Yes
- Required Role: None
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters:
  - address_id: integer
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "message": "Default address updated successfully.",
    "data": {
      "id": 1,
      "title": "Home",
      "country": "Egypt",
      "city": "Cairo",
      "street": "Main Street",
      "is_default": true
    }
  }
  ```
- Error Status Codes: 401 Unauthorized, 404 Not Found

### Business Rules

- All other addresses for the same user are reset to false before the requested address becomes default.

### cURL Example

```bash
curl -X PUT http://localhost:8000/api/users/set_default_address/1/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## Delete Address

### Endpoint Information

- HTTP Method: DELETE
- URL: /api/users/delete_address/<address_id>/
- Description: Deletes an address owned by the authenticated user.
- Authentication Required: Yes
- Required Role: None
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAuthenticated

### Request

- Path Parameters:
  - address_id: integer
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "message": "Address deleted successfully."
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized, 404 Not Found
- Error Response Example:
  ```json
  {
    "error": "Cannot delete the default address."
  }
  ```

### Business Rules

- Default addresses cannot be deleted.

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/users/delete_address/1/ \
  -c cookies.txt \
  -b cookies.txt
```

---

# Categories

## List Categories

### Endpoint Information

- HTTP Method: GET
- URL: /api/categories/
- Description: Returns all categories.
- Authentication Required: No
- Required Role: None
- Required Headers: None
- Required Cookies: None
- Permissions: Read-only for everyone; write methods require admin/moderator

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  [
    {
      "id": 1,
      "name": "Furniture",
      "image": "https://example.com/furniture.jpg",
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z"
    }
  ]
  ```

### cURL Example

```bash
curl -X GET http://localhost:8000/api/categories/
```

---

## Create Category

### Endpoint Information

- HTTP Method: POST
- URL: /api/categories/
- Description: Creates a category.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body:
  ```json
  {
    "name": "Furniture",
    "image": "https://example.com/furniture.jpg"
  }
  ```
- Required Fields:
  - name
- Optional Fields:
  - image
- Data Types: string
- Validation Rules:
  - Category name must be unique.
- Default Values: None
- Nullable Fields:
  - image

### Response

- Success Status Code: 201 Created
- Success Response Example:
  ```json
  {
    "id": 1,
    "name": "Furniture",
    "image": "https://example.com/furniture.jpg",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
  ```
- Error Status Codes: 400 Bad Request, 403 Forbidden, 401 Unauthorized

### cURL Example

```bash
curl -X POST http://localhost:8000/api/categories/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"name":"Furniture","image":"https://example.com/furniture.jpg"}'
```

---

## Retrieve Category

### Endpoint Information

- HTTP Method: GET
- URL: /api/categories/<id>/
- Description: Returns one category.
- Authentication Required: No
- Required Role: None
- Required Headers: None
- Required Cookies: None
- Permissions: Read-only for everyone

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "id": 1,
    "name": "Furniture",
    "image": "https://example.com/furniture.jpg",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
  ```
- Error Status Codes: 404 Not Found

### cURL Example

```bash
curl -X GET http://localhost:8000/api/categories/1/
```

---

## Update Category

### Endpoint Information

- HTTP Method: PUT/PATCH
- URL: /api/categories/<id>/
- Description: Updates a category.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Request

- Path Parameters:
  - id: integer
- Query Parameters: None
- Request Body:
  ```json
  {
    "name": "Home Furniture",
    "image": "https://example.com/new.jpg"
  }
  ```
- Optional Fields:
  - name
  - image

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "id": 1,
    "name": "Home Furniture",
    "image": "https://example.com/new.jpg",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
  ```
- Error Status Codes: 400 Bad Request, 403 Forbidden, 401 Unauthorized, 404 Not Found

### cURL Example

```bash
curl -X PUT http://localhost:8000/api/categories/1/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"name":"Home Furniture","image":"https://example.com/new.jpg"}'
```

---

## Delete Category

### Endpoint Information

- HTTP Method: DELETE
- URL: /api/categories/<id>/
- Description: Deletes a category.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Response

- Success Status Code: 204 No Content
- Error Status Codes: 403 Forbidden, 401 Unauthorized, 404 Not Found

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/categories/1/ \
  -c cookies.txt \
  -b cookies.txt
```

---

# Products

## List Products

### Endpoint Information

- HTTP Method: GET
- URL: /api/products/
- Description: Returns active products with pagination and nested images/variants.
- Authentication Required: No
- Required Role: None
- Required Headers: None
- Required Cookies: None
- Permissions: Read-only for everyone

### Request

- Path Parameters: None
- Query Parameters:
  - category=<id>
  - search=<term>
  - ordering=name|created_at|updated_at
  - page
  - page_size
- Request Body: None

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "Desk",
        "description": "Wood desk",
        "category": 1,
        "images": [
          {
            "id": 1,
            "image": "https://example.com/desk.jpg",
            "is_primary": true
          }
        ],
        "variants": [
          {
            "id": 1,
            "price": "120.00",
            "image": "https://example.com/variant.jpg",
            "attributes": [
              {
                "id": 1,
                "attribute_type": "Color",
                "value": "Brown"
              }
            ]
          }
        ],
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
      }
    ]
  }
  ```
- Error Status Codes: None specific from the implemented code

### Business Rules

- Soft-deleted products are excluded from the list.
- The response is paginated with 10 items per page by default.

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/products/?category=1&search=desk&ordering=-created_at&page=1&page_size=10"
```

---

## Create Product

### Endpoint Information

- HTTP Method: POST
- URL: /api/products/
- Description: Creates a product with nested variants and attributes.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body:
  ```json
  {
    "name": "Desk",
    "description": "Wood desk",
    "category": 1,
    "variants": [
      {
        "price": "120.00",
        "image": "https://example.com/variant.jpg",
        "attributes": [
          {
            "attribute_type": "Color",
            "value": "Brown"
          }
        ]
      }
    ]
  }
  ```
- Required Fields:
  - name
  - description
  - category
- Optional Fields:
  - variants
- Data Types:
  - name: string
  - description: string
  - category: integer (Category ID)
  - variants: array
- Validation Rules:
  - Each variant must contain at least one attribute.
  - Attribute type and value cannot be empty.
  - Duplicate attribute types inside the same variant are rejected.
  - Duplicate variant combinations are rejected.
- Default Values: None
- Nullable Fields: None

### Response

- Success Status Code: 201 Created
- Success Response Example:
  ```json
  {
    "id": 1,
    "name": "Desk",
    "description": "Wood desk",
    "category": 1,
    "images": [],
    "variants": [
      {
        "id": 1,
        "price": "120.00",
        "image": "https://example.com/variant.jpg",
        "attributes": [
          {
            "id": 1,
            "attribute_type": "Color",
            "value": "Brown"
          }
        ]
      }
    ],
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden

### Business Rules

- The create operation is wrapped in a transaction.
- The authenticated user is saved as created_by and updated_by.
- Variants are created from the nested payload and attributes are created underneath each variant.

### cURL Example

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"name":"Desk","description":"Wood desk","category":1,"variants":[{"price":"120.00","image":"https://example.com/variant.jpg","attributes":[{"attribute_type":"Color","value":"Brown"}]}]}'
```

---

## Retrieve Product

### Endpoint Information

- HTTP Method: GET
- URL: /api/products/<id>/
- Description: Returns one active product.
- Authentication Required: No
- Required Role: None
- Required Headers: None
- Required Cookies: None
- Permissions: Read-only for everyone

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "id": 1,
    "name": "Desk",
    "description": "Wood desk",
    "category": 1,
    "images": [],
    "variants": [],
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
  ```
- Error Status Codes: 404 Not Found

### cURL Example

```bash
curl -X GET http://localhost:8000/api/products/1/
```

---

## Update Product

### Endpoint Information

- HTTP Method: PUT/PATCH
- URL: /api/products/<id>/
- Description: Updates a product and replaces the entire variants tree.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Request

- Path Parameters:
  - id: integer
- Query Parameters: None
- Request Body:
  ```json
  {
    "name": "Desk Pro",
    "description": "Updated desk",
    "category": 1,
    "variants": [
      {
        "price": "140.00",
        "image": "https://example.com/variant-2.jpg",
        "attributes": [
          {
            "attribute_type": "Color",
            "value": "Black"
          }
        ]
      }
    ]
  }
  ```
- Optional Fields:
  - name
  - description
  - category
  - variants

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "id": 1,
    "name": "Desk Pro",
    "description": "Updated desk",
    "category": 1,
    "images": [],
    "variants": [
      {
        "id": 2,
        "price": "140.00",
        "image": "https://example.com/variant-2.jpg",
        "attributes": [
          {
            "id": 2,
            "attribute_type": "Color",
            "value": "Black"
          }
        ]
      }
    ],
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

### Business Rules

- The update operation is atomic.
- If variants are present, all existing variants and their attributes for the product are deleted and recreated from the payload.
- Frontend must send the full variants list on every update if variants are included.

### cURL Example

```bash
curl -X PUT http://localhost:8000/api/products/1/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"name":"Desk Pro","description":"Updated desk","category":1,"variants":[{"price":"140.00","image":"https://example.com/variant-2.jpg","attributes":[{"attribute_type":"Color","value":"Black"}]}]}'
```

---

## Delete Product (Soft Delete)

### Endpoint Information

- HTTP Method: DELETE
- URL: /api/products/<id>/
- Description: Soft-deletes a product by setting deleted_at.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Response

- Success Status Code: 204 No Content
- Error Status Codes: 401 Unauthorized, 403 Forbidden, 404 Not Found

### Business Rules

- The product is not physically removed.
- The list endpoints exclude soft-deleted products.

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/products/1/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## List Deleted Products

### Endpoint Information

- HTTP Method: GET
- URL: /api/products/deleted/
- Description: Returns soft-deleted products.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  [
    {
      "id": 2,
      "name": "Old Desk",
      "description": "Old desk",
      "category": 1,
      "images": [],
      "variants": [],
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z"
    }
  ]
  ```

### cURL Example

```bash
curl -X GET http://localhost:8000/api/products/deleted/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## Restore Product

### Endpoint Information

- HTTP Method: PATCH
- URL: /api/products/<id>/restore/
- Description: Restores a soft-deleted product.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "detail": "Product restored successfully."
  }
  ```
- Error Status Codes: 404 Not Found

### cURL Example

```bash
curl -X PATCH http://localhost:8000/api/products/2/restore/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## Hard Delete Product

### Endpoint Information

- HTTP Method: DELETE
- URL: /api/products/<id>/hard-delete/
- Description: Permanently deletes a product that is already soft-deleted.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Response

- Success Status Code: 204 No Content
- Error Status Codes: 404 Not Found

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/products/2/hard-delete/ \
  -c cookies.txt \
  -b cookies.txt
```

---

# Product Images

## List Product Images

### Endpoint Information

- HTTP Method: GET
- URL: /api/product-images/
- Description: Returns product images.
- Authentication Required: No
- Required Role: None
- Required Headers: None
- Required Cookies: None
- Permissions: Read-only for everyone

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  [
    {
      "id": 1,
      "image": "https://example.com/desk.jpg",
      "is_primary": true
    }
  ]
  ```

### cURL Example

```bash
curl -X GET http://localhost:8000/api/product-images/
```

---

## Create Product Image

### Endpoint Information

- HTTP Method: POST
- URL: /api/product-images/
- Description: Creates an image for a product.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Request

- Path Parameters: None
- Query Parameters: None
- Request Body:
  ```json
  {
    "product_id": 1,
    "image": "https://example.com/desk.jpg",
    "is_primary": true
  }
  ```
- Required Fields:
  - product_id
  - image
- Optional Fields:
  - is_primary
- Data Types: integer, string, boolean
- Validation Rules:
  - The parent product must exist and not be soft-deleted.
  - The first image for a product becomes primary automatically.
  - If a new image is marked primary, previous primary images are unset.
- Default Values:
  - is_primary defaults to false unless the product has no images yet.
- Nullable Fields:
  - image

### Response

- Success Status Code: 201 Created
- Success Response Example:
  ```json
  {
    "id": 1,
    "image": "https://example.com/desk.jpg",
    "is_primary": true
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

### Business Rules

- The view reads product_id directly from request.data, while the serializer itself does not expose product_id as a field.
- Frontend should send product_id even though it is not part of the serializer fields.

### cURL Example

```bash
curl -X POST http://localhost:8000/api/product-images/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"product_id":1,"image":"https://example.com/desk.jpg","is_primary":true}'
```

---

## Update Product Image

### Endpoint Information

- HTTP Method: PUT/PATCH
- URL: /api/product-images/<id>/
- Description: Updates a product image.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Request

- Path Parameters:
  - id: integer
- Query Parameters: None
- Request Body:
  ```json
  {
    "is_primary": true
  }
  ```
- Optional Fields:
  - image
  - is_primary

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "id": 1,
    "image": "https://example.com/desk.jpg",
    "is_primary": true
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

### cURL Example

```bash
curl -X PATCH http://localhost:8000/api/product-images/1/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"is_primary":true}'
```

---

## Delete Product Image

### Endpoint Information

- HTTP Method: DELETE
- URL: /api/product-images/<id>/
- Description: Deletes a product image.
- Authentication Required: Yes
- Required Role: ADMIN or MODERATOR
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAdminOrModeratorOrReadOnly

### Response

- Success Status Code: 204 No Content
- Error Status Codes: 401 Unauthorized, 403 Forbidden, 404 Not Found

### Business Rules

- If the deleted image was the primary one, the next oldest image for the same product becomes primary.

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/product-images/1/ \
  -c cookies.txt \
  -b cookies.txt
```

---

# Product Variants

Product variants are not exposed as standalone endpoints. They are nested under product create/update requests.

## Supported Payload Shape

```json
{
  "variants": [
    {
      "price": "120.00",
      "image": "https://example.com/variant.jpg",
      "attributes": [
        {
          "attribute_type": "Color",
          "value": "Brown"
        }
      ]
    }
  ]
}
```

## Business Rules

- A product can have multiple variants.
- Each variant must include at least one attribute.
- Duplicate attribute types inside the same variant are rejected.
- Duplicate variant combinations are rejected.
- Variant updates replace the full nested variant list for the target product.

---

# Offers

No API endpoints are currently implemented for offers.

The codebase contains the Offer, OfferProduct, OfferType, and OfferItemType models under the offers app, but there are no corresponding views, serializers, or URLs wired into the project.

---

# Cart

No API endpoints are currently implemented for cart operations.

The codebase contains Cart and CartItem models, but there are no views, serializers, or URLs wired into the project.

---

# Orders

No API endpoints are currently implemented for orders.

The codebase contains Order, OrderItem, Payment, OrderStatus, PaymentStatus, and PaymentProvider models, but there are no views, serializers, or URLs wired into the project.

---

# Dashboard

## List Dashboard Users

### Endpoint Information

- HTTP Method: GET
- URL: /api/dashboard/users/
- Description: Returns users for dashboard consumption.
- Authentication Required: Yes
- Required Role: ADMIN
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAdmin

### Request

- Path Parameters: None
- Query Parameters:
  - role
  - is_active
  - search
  - ordering
  - page
  - page_size

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "first_name": "Ahmed",
        "last_name": "Ali",
        "phone": "01012345678",
        "role": "CUSTOMER",
        "is_active": true,
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
      }
    ]
  }
  ```

### cURL Example

```bash
curl -X GET http://localhost:8000/api/dashboard/users/ \
  -c cookies.txt \
  -b cookies.txt
```

---

## Update Dashboard User

### Endpoint Information

- HTTP Method: PUT/PATCH
- URL: /api/dashboard/users/<id>/
- Description: Updates a user from the dashboard.
- Authentication Required: Yes
- Required Role: ADMIN
- Required Headers: Content-Type: application/json
- Required Cookies: access_token
- Permissions: IsAdmin

### Request

- Path Parameters:
  - id: integer
- Query Parameters: None
- Request Body:
  ```json
  {
    "first_name": "Ahmed",
    "is_active": true,
    "password": "NewStrongPass123"
  }
  ```
- Optional Fields:
  - first_name
  - last_name
  - phone
  - password
  - role
  - is_active

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "id": 1,
    "first_name": "Ahmed",
    "last_name": "Ali",
    "phone": "01012345678",
    "role": "CUSTOMER",
    "is_active": true,
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

### cURL Example

```bash
curl -X PATCH http://localhost:8000/api/dashboard/users/1/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"is_active":false}'
```

---

## Delete Dashboard User

### Endpoint Information

- HTTP Method: DELETE
- URL: /api/dashboard/users/<id>/
- Description: Deletes a user from the dashboard.
- Authentication Required: Yes
- Required Role: ADMIN
- Required Headers: None
- Required Cookies: access_token
- Permissions: IsAdmin

### Response

- Success Status Code: 200 OK
- Success Response Example:
  ```json
  {
    "detail": "User deleted successfully."
  }
  ```
- Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

### Business Rules

- The authenticated admin cannot delete their own account.
- The deletion is a hard delete.

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/dashboard/users/2/ \
  -c cookies.txt \
  -b cookies.txt
```

---

# Models Summary

## User

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| phone | CharField(11) | Yes | No | No | Login identifier |
| first_name | CharField(30) | Yes | No | No | N/A |
| last_name | CharField(30) | Yes | No | No | N/A |
| role | CharField(choices) | No | No | Yes in auth serializer | N/A |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |
| is_staff | BooleanField | No | No | No | Django admin flag |
| is_active | BooleanField | No | No | No | Account active flag |

## Address

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| title | CharField(100) | Yes | No | No | N/A |
| user | ForeignKey(User) | Yes | No | No | Belongs to user |
| country | CharField(100) | Yes | No | No | N/A |
| city | CharField(100) | Yes | No | No | N/A |
| street | CharField(255) | Yes | No | No | N/A |
| is_default | BooleanField | No | No | No | One default address per user |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |

## Category

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| name | CharField(100) | Yes | No | No | N/A |
| image | CharField(255) | No | Yes | No | URL-like string |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |

## Product

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| name | CharField(100) | Yes | No | No | N/A |
| description | TextField | Yes | No | No | N/A |
| category | ForeignKey(Category) | Yes | No | No | Belongs to category |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |
| created_by | ForeignKey(User) | No | Yes | No | Creator |
| updated_by | ForeignKey(User) | No | Yes | No | Last updater |

## ProductImage

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| product | ForeignKey(Product) | Yes | No | No | Belongs to product |
| image | CharField(255) | No | Yes | No | URL-like string |
| is_primary | BooleanField | No | No | No | One primary image per product |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |

## ProductVariant

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| image | CharField(255) | No | Yes | No | URL-like string |
| product | ForeignKey(Product) | Yes | No | No | Belongs to product |
| price | DecimalField(10,2) | Yes | No | No | Variant price |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |

## ProductVariantAttribute

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| variant | ForeignKey(ProductVariant) | Yes | No | No | Belongs to variant |
| attribute_type | CharField(100) | Yes | No | No | Attribute name |
| value | CharField(100) | Yes | No | No | Attribute value |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |

## Offer

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| name | CharField(255) | Yes | No | No | N/A |
| offer_type | CharField(choices) | Yes | No | No | N/A |
| value | DecimalField(10,2) | No | Yes | No | Percentage or fixed amount |
| starts_at | DateTimeField | Yes | No | No | N/A |
| ends_at | DateTimeField | Yes | No | No | N/A |
| is_active | BooleanField | No | No | No | N/A |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |

## OfferProduct

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| offer | ForeignKey(Offer) | Yes | No | No | Belongs to offer |
| product | ForeignKey(Product) | Yes | No | No | Belongs to product |
| item_type | CharField(choices) | Yes | No | No | Required or gift |
| quantity | PositiveIntegerField | No | No | No | Quantity in offer |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |

## Cart

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| user | OneToOneField(User) | Yes | No | No | User cart |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |

## CartItem

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| cart | ForeignKey(Cart) | Yes | No | No | Belongs to cart |
| product_variant | ForeignKey(ProductVariant) | Yes | No | No | Variant added to cart |
| quantity | PositiveIntegerField | No | No | No | Minimum 1 |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |

## Order

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| user | ForeignKey(User) | Yes | No | No | Buyer |
| address | ForeignKey(Address) | Yes | No | No | Delivery address |
| status | CharField(choices) | No | No | No | Order status |
| subtotal | DecimalField(10,2) | Yes | No | No | N/A |
| discount | DecimalField(10,2) | No | No | No | N/A |
| total | DecimalField(10,2) | Yes | No | No | N/A |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |

## OrderItem

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| order | ForeignKey(Order) | Yes | No | No | Belongs to order |
| product_variant | ForeignKey(ProductVariant) | Yes | No | No | Variant purchased |
| product_name | CharField(255) | Yes | No | No | Snapshot name |
| variant_description | CharField(255) | Yes | No | No | Snapshot description |
| price | DecimalField(10,2) | Yes | No | No | Unit price |
| quantity | PositiveIntegerField | Yes | No | No | Quantity |
| subtotal | DecimalField(10,2) | Yes | No | No | Line total |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |

## Payment

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| order | ForeignKey(Order) | Yes | No | No | Belongs to order |
| provider | CharField(choices) | No | No | No | Payment provider |
| transaction_id | CharField(255) | No | Yes | No | External transaction id |
| status | CharField(choices) | No | No | No | Payment status |
| amount | DecimalField(10,2) | Yes | No | No | Paid amount |
| paid_at | DateTimeField | No | Yes | No | Payment timestamp |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |
| deleted_at | DateTimeField | No | Yes | No | Soft delete marker |

## Setting

| Field | Type | Required | Nullable | Read Only | Relationship |
|---|---|---:|---:|---:|---|
| id | BigAutoField | Yes | No | Yes | Primary key |
| site_name | CharField(255) | Yes | No | No | N/A |
| logo | ImageField | No | Yes | No | Uploaded image |
| phone | CharField(11) | Yes | No | No | Contact phone |
| currency | CharField(10) | Yes | No | No | Currency code |
| facebook | URLField | No | Yes | No | N/A |
| instagram | URLField | No | Yes | No | N/A |
| privacy_policy | TextField | Yes | No | No | N/A |
| terms | TextField | Yes | No | No | N/A |
| created_at | DateTimeField | Yes | No | Yes | N/A |
| updated_at | DateTimeField | Yes | No | Yes | N/A |

---

# Common Errors

- Invalid credentials:
  ```json
  {
    "non_field_errors": ["Invalid credentials"]
  }
  ```
- Duplicate address:
  ```json
  {
    "message": ["This address already exists."]
  }
  ```
- Validation error for products and variants:
  ```json
  {
    "variants": ["Product must have at least one variant."],
    "attributes": ["Each variant must have at least one attribute."],
    "attribute_type": ["Attribute type cannot be empty."],
    "value": ["Attribute value cannot be empty."]
  }
  ```
- Missing refresh cookie:
  ```json
  {
    "detail": "Refresh token cookie is missing."
  }
  ```
- Default address deletion attempt:
  ```json
  {
    "error": "Cannot delete the default address."
  }
  ```
- Self-deletion attempt in dashboard:
  ```json
  {
    "detail": "You cannot delete your own account."
  }
  ```

---

# HTTP Status Codes

- 200 OK: Successful GET, PUT, PATCH, and some DELETE flows.
- 201 Created: Successful POST for auth, addresses, categories, products, and product images.
- 204 No Content: Successful logout and successful delete flows.
- 400 Bad Request: Validation failures, invalid credentials, duplicate addresses, and invalid payloads.
- 401 Unauthorized: Missing or invalid authentication cookies.
- 403 Forbidden: Authenticated user lacks permission for admin/moderator-only operations.
- 404 Not Found: Missing resource, address, or product.
- 405 Method Not Allowed: Unsupported method for a route, for example POST on the dashboard user endpoint.

---

# Frontend Integration Notes

- Always call auth endpoints with credentials enabled.
- Do not expect JWTs to be returned in the JSON body; the API uses HttpOnly cookies instead.
- Use the access_token cookie for authenticated calls and the refresh_token cookie for refresh/logout flows.
- The frontend should be prepared to handle cookie-based authentication and CSRF-protected writes.
- Category and product image fields are simple string URL fields, not file upload fields.
- Product images should be sent as URLs in the image field.
- Product variants are nested under the product payload and are not separate endpoints.
- Updating a product with variants replaces the whole variant tree, so the full list must be sent.
- Soft-deleted products remain visible through the deleted endpoint but are absent from the normal list endpoint.
- The backend does not currently expose offers, cart, or orders over HTTP.
- The current CORS configuration only allows http://localhost:3000 with credentials enabled.


```ts
const savedUsersStr = localStorage.getItem("th_users");
```

What to change:
- Replace localStorage user lookup with backend users when the endpoint is available.
- Keep localStorage only as a temporary fallback, not the main source of truth.

Also update CRUD handlers to call API functions instead of mutating arrays only in memory.

---

### `src/data/salondata.ts`

This file is currently acting as a mock catalog.

What to change:
- Keep it only as a fallback seed during migration.
- Do not use it as the live source after API wiring is complete.

Suggested migration path:
1. Load from API first.
2. Fall back to `salondata` only if the request fails.
3. Remove the fallback after backend stability is confirmed.

---

## 5) Integration Order

Use this order to wire the project with the least friction:

1. Set `NEXT_PUBLIC_API_URL`.
2. Connect `GET /products` and `GET /categories` in `src/app/page.tsx`.
3. Connect `GET /products/{id}` in `src/app/product/[id]/page.tsx`.
4. Connect `GET /orders` and admin CRUD in `src/app/admin/page.tsx`.
5. Replace the remaining localStorage-backed admin user lookup.
6. Add loading and error states everywhere the network can fail.

---

## 6) Notes For The Backend Team

Please keep these response rules stable:

- Use `id` as a string UUID everywhere.
- Return `images` and `variants` on products.
- Return `media_url` on categories.
- Return `items` on orders.
- Keep `status` values aligned with the frontend enum values.
- Keep login/register response shapes consistent with `token` and `user`.

If the backend team can keep those field names stable, the frontend will need minimal changes.
