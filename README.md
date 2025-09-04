# Short Explanation

Kirim Now REST API is a backend system designed for courier and logistics operations. This project was developed to further explore the use of the NestJS framework and modern backend architecture patterns, and showcases enterprise-grade features and integrations.

## Key Features

1. JWT-based authentication and authorization, along with role and permission management.
2. Implementation of an email notification system integrated with NestJS, as well as a queue system for efficient and reliable email delivery.
3. This system will be equipped with Xendit payment gateway integration that supports various payment methods, including an auto-expired payment feature utilizing Redis queues when invoices are not paid within a specified expiration time.
4. Shipment management, including creation, tracking, and shipment status.
5. Management of branches, couriers, and shipment history.
6. Creation of shipping labels in PDF format complete with QR codes.
7. Implementation of Turf.js to calculate the distance between two coordinate points (longitude and latitude).
8. Implementation with OpenCage to perform geocoding, which converts addresses into geographic coordinates (latitude and longitude).
9. Implementation of Google Cloud Storage for storage media.
10. Using Redis as a message broker to manage email queues and various background jobs.

## API Endpoints

List of available routes:

**Authentication Routes**:

```http
POST /api/v1/login - User login
POST /api/v1/register - Register new user
```

**Roles Management**:

```http
GET /api/v1/roles - Get list of all roles
GET /api/v1/roles/:id - Get role details by ID
PATCH /api/v1/roles/:id - Update role by ID
```

**Permissions Management**:

```http
GET /api/v1/permissions - Get list of all permissions
```

**Profile Management**:

```http
GET /api/v1/profile - Get current user profile
PATCH /api/v1/profile - Update user profile
```

**Branches Management**:

```http
POST /api/v1/branches - Create new branch
GET /api/v1/branches - Get list of all branches
GET /api/v1/branches/:id - Get branch details by ID
PATCH /api/v1/branches/:id - Update branch by ID
DELETE /api/v1/branches/:id - Delete branch by ID
```

**Employee Branch Management**:

```http
POST /api/v1/employee-branch - Assign employee to branch
GET /api/v1/employee-branch - Get list of employee-branch assignments
GET /api/v1/employee-branch/:id - Get employee-branch details by ID
PATCH /api/v1/employee-branch/:id - Update employee-branch assignment
DELETE /api/v1/employee-branch/:id - Remove employee from branch
```

**User Address Management**:

```http
POST /api/v1/user-address - Add new user address
GET /api/v1/user-address - Get list of user addresses
GET /api/v1/user-address/:id - Get address details by ID
PATCH /api/v1/user-address/:id - Update user address
DELETE /api/v1/user-address/:id - Delete user address
```

**Shipments Management**:

```http
POST /api/v1/shipments - Create new shipment
GET /api/v1/shipments/:id/pdf - Download shipment label in PDF format
GET /api/v1/shipments - Get list of all shipments
GET /api/v1/shipments/tracking/:trackingNumber - Track shipment by tracking number
GET /api/v1/shipments/:id - Get shipment details by ID
PATCH /api/v1/shipments/:id - Update shipment data
DELETE /api/v1/shipments/:id - Delete shipment
```

**Shipment Webhook**:

```http
POST /api/v1/shipments/webhook - Webhook for payment notifications or status updates
```

**Courier Operations**:

```http
GET /api/v1/courier/shipments - Get list of shipments for courier
POST /api/v1/courier/pick/:trackingNumber - Pick up package from sender
POST /api/v1/courier/pickup/:trackingNumber - Confirm package pickup
POST /api/v1/courier/deliver-to-branch/:trackingNumber - Deliver package to branch
POST /api/v1/courier/pick-shipment-from-branch/:trackingNumber - Pick up package from branch
POST /api/v1/courier/pickup-shipment-from-branch/:trackingNumber - Confirm pickup from branch
POST /api/v1/courier/deliver-to-customer/:trackingNumber - Deliver package to customer
```

**Shipment Branch Operations**:

```http
GET /api/v1/shipment-branch/logs - Get branch activity logs
POST /api/v1/shipment-branch/scan - Scan package QR code at branch
```

**History**:

```http
GET /api/v1/history - Get activity history
GET /api/v1/history/:id - Get history details by ID
```
