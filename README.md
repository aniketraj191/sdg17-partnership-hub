# SDG 17 Partnership Hub — Partnerships for the Goals

> A full-stack web platform built for United Nations **Sustainable Development Goal 17 (SDG 17)**: *Partnerships for the Goals*. Enables NGOs, social enterprises, academic institutions, governments, and local community organizations to register, publish sustainable initiatives, express collaborative interest, and transparently audit monetary and in-kind resources.

---

## 1. Technology Stack

- **Frontend**:
  - React 18 with Vite
  - JavaScript (ES Modules)
  - Tailwind CSS (Forest Green & Emerald Sustainability Theme)
  - React Router DOM v6
  - Axios with request/response interceptors & credentials
  - Lucide React icons
  - Recharts (responsive analytics & distribution charts)
- **Backend**:
  - Node.js (v18+ / v22+) & Express.js
  - Mongoose ODM (v8)
  - REST API Architecture
  - Cookie-parser, Helmet, CORS, Express-Rate-Limit
  - bcryptjs (secure password hashing)
  - JSON Web Tokens (JWT) authentication
- **Database**:
  - MongoDB Atlas Cloud Database (Primary)
  - MongoDB Shell (`mongosh`) for record inspection
  - Built-in In-Memory fallback for immediate zero-config local testing

---

## 2. Directory Structure

```
MONGODB_PROJECt/
├── .gitignore
├── package.json                   # Root convenience scripts
├── README.md                      # Complete setup & operational guide
├── server/
│   ├── .env                       # Backend environment variables
│   ├── .env.example               # Backend template with Atlas placeholders
│   ├── package.json
│   ├── server.js                  # Server entry & database connection
│   ├── app.js                     # Express app, middleware, routes
│   ├── config/
│   │   └── db.js                  # Mongoose MongoDB connection
│   ├── models/
│   │   ├── User.js                # Users with hashed passwords & roles
│   │   ├── Organization.js        # NGOs, Companies, Governments, Communities
│   │   ├── Project.js             # Sustainability initiatives
│   │   ├── Partnership.js         # Cross-sector collaboration requests
│   │   ├── Contribution.js        # Transparent financial & in-kind ledger
│   │   └── ContactMessage.js      # Public inquiries
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & role authorization
│   │   ├── validateObjectId.js    # Safe MongoDB ObjectId checker
│   │   └── errorHandler.js        # Central error handler & 404 handler
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── organizationController.js
│   │   ├── projectController.js
│   │   ├── partnershipController.js
│   │   ├── contributionController.js
│   │   ├── dashboardController.js
│   │   └── contactController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── organizationRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── partnershipRoutes.js
│   │   ├── contributionRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── contactRoutes.js
│   └── scripts/
│       ├── seed.js                # Demonstration data seeder
│       └── test-api.js            # Automated 15-point API test suite
└── client/
    ├── .env                       # Frontend environment variables
    ├── .env.example
    ├── package.json
    ├── vite.config.js             # Vite configuration with /api proxy
    ├── tailwind.config.js         # Custom Forest & Emerald green theme
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── api/
        │   └── axiosClient.js     # Configured Axios client
        ├── context/
        │   ├── AuthContext.jsx    # Authentication & user state
        │   └── NotificationContext.jsx # Toast notifications
        ├── components/
        │   ├── Navbar.jsx         # Responsive navigation & auth dropdown
        │   ├── Footer.jsx         # Sustainability links & transparency notice
        │   ├── Modal.jsx          # Accessible dialog modal
        │   ├── ConfirmDialog.jsx  # Deletion confirmation
        │   ├── StatCard.jsx       # Metric cards
        │   ├── Badge.jsx          # Status & SDG pills
        │   ├── EmptyState.jsx     # Reusable empty states
        │   └── LoadingSkeleton.jsx# Card/table skeletons & spinner
        ├── pages/
        │   ├── Home.jsx           # Landing page with SDG 17 mission
        │   ├── Dashboard.jsx      # Recharts analytics & MongoDB aggregations
        │   ├── Organizations.jsx  # Organizations directory & CRUD
        │   ├── OrganizationDetails.jsx # Organization profile & managed projects
        │   ├── Projects.jsx       # Sustainability initiatives & CRUD
        │   ├── ProjectDetails.jsx # Detailed metrics & contribution ledger
        │   ├── Partnerships.jsx   # Matchmaking & collaboration requests
        │   ├── Contributions.jsx  # Transparent multi-type ledger
        │   ├── AboutSDG17.jsx     # Educational guide on UN goals
        │   ├── Contact.jsx        # Contact form with database storage
        │   ├── Login.jsx          # Sign In with 1-click demo accounts
        │   ├── Register.jsx       # User registration
        │   └── AdminDashboard.jsx # Account management & admin message viewer
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

---

## 3. Step-by-Step Setup Instructions (Windows / PowerShell)

### Step 1: Install Dependencies

From the project root directory, run:

```powershell
# Install root, server, and client dependencies
npm run install:all
```

Or install individually:

```powershell
cd server
npm install
cd ..\client
npm install
cd ..
```

---

### Step 2: Configure MongoDB Atlas

To connect the application to your real cloud MongoDB Atlas cluster:

1. **Log in or Sign Up**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. **Create a Free Cluster**: Select **M0 Free Shared Cluster** on your nearest cloud provider region (e.g., AWS / Azure / GCP).
3. **Create Database User**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Select **Password Authentication**.
   - Enter a username (e.g., `sdg_admin`) and a secure password.
   - Assign database privilege: **Read and write to any database** (or `Built-in Role: readWrite`).
   - Click **Add User**.
4. **Configure Network Access (IP Whitelist)**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere (`0.0.0.0/0`)** for development, or add your current workstation IP address.
   - Click **Confirm**.
5. **Obtain Connection String**:
   - Go to **Deployment > Database**.
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sdg17_hub?retryWrites=true&w=majority
     ```

---

### Step 3: Configure Environment Variables

#### Backend (`server/.env`):
Create or update `server/.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://sdg_admin:<your_password>@cluster0.abcde.mongodb.net/sdg17_hub?retryWrites=true&w=majority
JWT_SECRET=super_secret_sdg17_hub_jwt_security_token_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> **Note**: If `MONGODB_URI` contains placeholder credentials (e.g., `username:password`), the backend automatically starts an in-memory MongoDB instance for immediate offline testing without crashing.

#### Frontend (`client/.env`):
Ensure `client/.env` contains:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### Step 4: Seed Demonstration Data

Run the seed script to populate realistic sample organizations, projects, verified contributions, and partnership proposals:

```powershell
npm run seed
```

Output:
```
--- Starting SDG 17 Partnership Hub Database Seed ---
Creating demo users...
Creating demo organizations...
Creating demo projects...
Creating demo partnerships...
Creating demo contributions...
Creating demo contact message...
=======================================================
 SUCCESS: SDG 17 Partnership Hub Seed Data Populated! 
 Demonstration Credentials:
 - Admin: admin@sdg17hub.demo / Admin@123456
 - Org 1: greenearth@sdg17hub.demo / Partner@123456
 - Org 2: edulearn@sdg17hub.demo / Partner@123456
 - Org 3: cleanpower@sdg17hub.demo / Partner@123456
=======================================================
```

---

### Step 5: Run the Backend API Test Suite

Verify all 15 endpoints, aggregations, validations, and security middleware:

```powershell
npm run test:api
```

Output:
```
[PASS] Health Check Endpoint (GET /api/health)
[PASS] User Registration (POST /api/auth/register)
[PASS] Get Current User (GET /api/auth/me)
[PASS] Create Organization (POST /api/organizations)
[PASS] List Organizations with Filters (GET /api/organizations)
[PASS] Create Project (POST /api/projects)
[PASS] Get Project by ID with Calculated Metrics (GET /api/projects/:id)
[PASS] Record Contribution (POST /api/contributions)
[PASS] Project Funding Progress Recalculation (15,000 / 40,000 = 38%)
[PASS] Dashboard Stats Aggregation (GET /api/dashboard/stats)
[PASS] Dashboard Charts Aggregation (GET /api/dashboard/charts)
[PASS] Submit Partnership Request (POST /api/partnerships)
[PASS] Update Partnership Status (PATCH /api/partnerships/:id/status)
[PASS] Submit Contact Inquiry (POST /api/contact)
[PASS] Invalid ObjectId Rejection (GET /api/projects/:invalidId)
Tests Completed: 15 | Passed: 15 | Failed: 0
```

---

### Step 6: Start the Application

Open two PowerShell windows:

**Terminal 1 (Backend Server):**
```powershell
cd c:\Users\anike\Desktop\MONGODB_PROJECt\server
npm start
# Or for watch mode: npm run dev
```

**Terminal 2 (Frontend Client):**
```powershell
cd c:\Users\anike\Desktop\MONGODB_PROJECt\client
npm run dev
```

The frontend will be live at: **http://localhost:5173**  
The backend API is accessible at: **http://localhost:5000/api**  
Health Check: **http://localhost:5000/api/health**

---

## 4. Inspecting Database Records Using `mongosh`

You can connect to your MongoDB Atlas cluster directly using the official [MongoDB Shell (mongosh)](https://www.mongodb.com/products/tools/shell):

```powershell
# Connect to your Atlas cluster
mongosh "mongodb+srv://cluster0.abcde.mongodb.net/sdg17_hub" --apiVersion 1 --username sdg_admin
```

### Useful mongosh Inspection Commands:

```javascript
// 1. Switch to the database
use sdg17_hub;

// 2. View all collections
show collections;
// Output: contactmessages, contributions, organizations, partnerships, projects, users

// 3. Count documents in each collection
db.organizations.countDocuments();
db.projects.countDocuments();
db.contributions.countDocuments();

// 4. View registered organizations
db.organizations.find({}, { name: 1, type: 1, city: 1, country: 1 }).pretty();

// 5. Query active sustainability projects
db.projects.find({ status: "Active" }, { title: 1, category: 1, fundingTarget: 1 }).pretty();

// 6. Inspect confirmed monetary contributions using MongoDB Aggregation:
db.contributions.aggregate([
  { $match: { status: "Confirmed", contributionType: "Monetary" } },
  { $group: { _id: null, totalAuditedGrants: { $sum: "$amount" } } }
]);

// 7. Check submitted partnership proposals:
db.partnerships.find({}, { status: 1, supportTypes: 1, createdAt: 1 }).pretty();
```

---

## 5. Troubleshooting Common MongoDB Atlas Connection Errors

| Error Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `MongoServerSelectionError: connection timed out` | IP is blocked by Atlas Network Access firewall. | In Atlas, go to **Network Access > Add IP Address > Allow Access from Anywhere (`0.0.0.0/0`)** or add your current public IP. |
| `MongoServerError: Authentication failed` | Invalid username or password in connection string. | Verify user in **Database Access**. Remember to URL-encode special characters in your password (e.g., `#`, `@`, `%`) or use an alphanumeric password. |
| `querySrv ENOTFOUND _mongodb._tcp...` | DNS provider cannot resolve SRV record. | Use Google Public DNS (`8.8.8.8`, `8.8.4.4`) or Cloudflare (`1.1.1.1`), or use the standard non-SRV connection string. |
| `MongooseError: Operation buffering timed out` | Database connection lost during request execution. | Check your internet connectivity and ensure the cluster is active (not paused in free tier). |

---

## 6. REST API Reference

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | GET | Public | API status and server health |
| `/api/auth/register` | POST | Public | Register new user account |
| `/api/auth/login` | POST | Public | Authenticate user & return JWT |
| `/api/auth/logout` | POST | Public | Clear authentication cookie |
| `/api/auth/me` | GET | Private | Get authenticated user profile |
| `/api/organizations` | GET | Public | List organizations with filters & search |
| `/api/organizations/:id` | GET | Public | Get organization profile & managed projects |
| `/api/organizations` | POST | Private | Register new organization |
| `/api/organizations/:id` | PUT | Private | Update organization (Owner or Admin) |
| `/api/organizations/:id` | DELETE | Private | Delete organization (Owner or Admin) |
| `/api/projects` | GET | Public | List projects with funding metrics & sorting |
| `/api/projects/:id` | GET | Public | Project details with calculated contributions |
| `/api/projects` | POST | Private | Create new project |
| `/api/projects/:id` | PUT | Private | Update project (Owner or Admin) |
| `/api/projects/:id` | DELETE | Private | Delete project (Owner or Admin) |
| `/api/partnerships` | GET | Public | List partnership requests |
| `/api/partnerships` | POST | Private | Submit partnership expression of interest |
| `/api/partnerships/:id/status`| PATCH | Private | Update request status (Accepted/Rejected) |
| `/api/contributions` | GET | Public | Transparent ledger with breakdown totals |
| `/api/contributions` | POST | Public/Priv | Record monetary or non-monetary contribution |
| `/api/contributions/:id` | PUT | Private | Verify / confirm contribution |
| `/api/dashboard/stats` | GET | Public | Aggregated counters from MongoDB |
| `/api/dashboard/charts` | GET | Public | Visual chart datasets for Recharts |
| `/api/contact` | POST | Public | Submit inquiry (recorded in database) |
| `/api/contact` | GET | Private (Admin)| Review submitted contact inquiries |

---

## 7. Demonstration Accounts

For evaluation and testing, the following demonstration accounts are pre-seeded:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@sdg17hub.demo` | `Admin@123456` | Full platform access, review contact inquiries, verify records |
| **Green Earth NGO** | `greenearth@sdg17hub.demo` | `Partner@123456` | Climate Action & Mangrove projects lead |
| **Digital Learning** | `edulearn@sdg17hub.demo` | `Partner@123456` | Education STEM hubs initiative |
| **Clean Energy Co.** | `cleanpower@sdg17hub.demo` | `Partner@123456` | Solar micro-grids for rural clinics |

*Tip: You can also use the 1-click login buttons on the Login page (`/login`) to instantly sign into any of these accounts.*

---

## 8. Transparency & Non-Payment Notice

Per UN SDG 17 platform guidelines:
- This system is an institutional **contribution and partnership tracking ledger**, not a retail payment gateway.
- Credit card details are never collected or stored.
- Confirmed monetary contributions represent verified co-financing disbursements.
- Non-monetary contributions (volunteer hours, hardware units, technical services) are audited separately and are never converted into arbitrary cash figures.
