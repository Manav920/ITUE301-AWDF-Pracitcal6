# ITUE301 - Advanced Web Development Frameworks
## Practical 6: Full Stack Integration (React + Node.js + MongoDB)

### Student Details
- **Student ID:** 24CS050
- **Student Name:** Vivek Maheshwari
- **Subject Code & Name:** CSE304 / ITUE301: Advanced Web Development Frameworks
- **Department:** Department of Computer Science and Engineering
- **Institution:** Chandubhai S Patel Institute of Technology (CSPIT), CHARUSAT
- **Academic Year:** 2025-26

---

### Aim
To wire the React single-page frontend to the Node/Express/MongoDB backend into a fully integrated, functional full-stack MERN application with complete CRUD operations, optimistic state synchronization, and robust error handling.

---

### System Architecture & Data Flow
```text
React Frontend (Vite @ http://localhost:5173)
 │
 │  1. fetch(http://localhost:5000/tasks, { method, headers, body })
 ▼
Express REST API (Node.js @ http://localhost:5000)
 │  [CORS Enabled Middleware]
 │  [JSON Body Parser & Request Logger]
 │  [Route Handlers with Try/Catch]
 ▼
Mongoose ODM & MongoDB Database (@ localhost:27017)
 └── Database: task_manager_24cs050 (collection: tasks)
 │
 ▼
Response Flow:
 MongoDB commits document → Express sends JSON (200/201/400/404) →
 React updates state → UI re-renders → Toast notification confirms operation
```

---

### Key Features Implemented

1. **Centralized API Client (`frontend/src/api.js`)**:
   - Single point of configuration for the backend base URL (`http://localhost:5000`).
   - Standardized fetch wrappers for `getTasks()`, `getTaskById()`, `createTask()`, `updateTask()`, and `deleteTask()`.

2. **Full-Stack CRUD from React UI (`TaskManager.jsx`)**:
   - **Create (POST)**: Form with title, priority enum (`low`, `medium`, `high`), category, and description.
   - **Read (GET)**: Fetches all persistent MongoDB documents on component mount via `useEffect`.
   - **Update (PUT)**: Interactive status checkbox toggling task `completed` status directly in MongoDB.
   - **Delete (DELETE)**: Immediate deletion with safety modal.

3. **Supplementary Elevations Added**:
   - **Optimistic UI Updates**: Newly created tasks and status toggles appear on screen instantly, with graceful rollback if the server rejects the request.
   - **Delete Confirmation Modal**: Custom dialog prompting user confirmation before permanently deleting any document from MongoDB.
   - **Toast Notifications**: Floating feedback alerts confirming success or failure for every network interaction.

---

### How to Run Locally

#### Prerequisites
- Node.js (v18+)
- MongoDB Community Server running locally on port 27017

#### 1. Start the Backend Server (Terminal 1)
```bash
cd backend
npm install
npm start
# Express runs on http://localhost:5000
```

#### 2. Start the React Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
# React SPA runs on http://localhost:5173
```

---

### Step-by-Step Screenshots Guide for Practical 6 Report

1. **6.1 Full-Stack Task Manager Interface**:
   - Open `http://localhost:5173/tasks`.
   - Capture the active task list populated directly from MongoDB with the **"Connected Backend: http://localhost:5000/tasks"** green indicator.
2. **6.2 Task Creation with Optimistic Update & Toast**:
   - Fill in a new task title and click **"+ Add Task"**.
   - Capture the newly added task appearing in the list alongside the green **Toast notification** confirming: `Task "..." saved to MongoDB!`.
3. **6.3 Task Update (Toggle Status)**:
   - Click the checkbox next to any task to mark it as Completed.
   - Capture the strikethrough text and the update Toast: `Task marked as Completed!`.
4. **6.4 Delete Confirmation Dialog**:
   - Click the 🗑️ trash icon next to a task.
   - Capture the **"Confirm Deletion"** modal dialog asking for confirmation before deleting.
5. **6.5 Persistence Verification (Browser Refresh)**:
   - Refresh the page (`F5`) to demonstrate that all changes, additions, and updates remain saved in the MongoDB database.
