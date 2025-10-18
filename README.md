# Task 3 - Frontend Setup Guide
Overview:
    This guide will help you set up the React 19 + TypeScript + Ant Design frontend for the Task Execution Manager.

# What we build?
A modern, accessible web UI with:

        React 19 - Latest React version
        TypeScript - Type-safe code
        Ant Design - Enterprise-grade UI components
        Vite - Fast build tool
        Full CRUD Operations - Create, Read, Update, Delete
        Task Execution - Execute and view output
        Search Functionality - Find tasks by name
        Responsive Design - Works on all screen sizes
        Accessibility - WCAG compliant

# Directory Structure
task-manager-ui/
├── node_modules/          
├── public/                
├── src/
│   ├── App.tsx           
│   ├── App.css           
│   ├── main.tsx          
│   ├── index.css         
│   └── vite-env.d.ts     
├── index.html            
├── package.json          
├── tsconfig.json         
├── tsconfig.node.json    
├── vite.config.ts        
└── README.md             

# Prerequisites
Required Software:
    node --version  # Should be v18.0.0 or higher
    npm --version   # Should be v9.0.0 or higher

![node and npm version](./Snapshots/1Prerequisites.png)

    # If not installed:
    # macOS: brew install node

Backend Running
Make sure your backend is running:
    # From task-api directory
    kubectl get pods
    # Both mongodb and task-api should be Running

![Backend Running](./Snapshots/2Backend_Running.png)

    # Test backend
    curl http://localhost:30080/tasks
    # Should return: []

![Test Backend by curl](./Snapshots/3TestBackend.png)

    # Install all dependencies (this takes 2-3 minutes)
    npm install

![npm Install](./Snapshots/5npm_install.png)

***IGNORE***
    package.json

![Package json](./Snapshots/4PackageJsonnpmInity.png)

    npm install --save-dev @types/node

![Save Dev](./Snapshots/Save_dev.png)

***

# Verify installation
ls node_modules
#Should see: react, react-dom, antd, typescript, vite, etc.

![Verify Installation](./Snapshots/6Verify_installation.png)

# Start Development Server
#Start the dev server
npm run dev

Expected output:
    VITE v5.0.8  ready in 500 ms
    ➜  Local:   http://localhost:3000/
    ➜  Network: use --host to expose
    ➜  press h + enter to show help

![Start Server](./Snapshots/7StartDevelopmentServer.png)

# Open in Browser:
    # Open your browser to:
    http://localhost:3000

![UI in Browser](./Snapshots/8UiInBrowser.png)

# Testing
# Test1: Create a Task
    1. Click "Create New Task" button
    2. Fill in the form:

        ID: test-1
        Name: Test Task
        Owner: Your Name
        Command: echo Hello World

![Fill the form](./TestSnapshots/Test-1.1.png)

    3. Click "Create Task"

![Task Created](./TestSnapshots/Test-1.2.png)

# Test2: Execute a Task
    1. Find your task in the table

![Find Task](./TestSnapshots/Test-2.1.png)

    2. Click "Execute" button

![Execute Button](./TestSnapshots/Test-2.2.png)

    3. Wait 2-3 seconds

![Check for Executions in Dashboard](./TestSnapshots/Test-2.3.png)

# Test3: View Execution History
    1. Click "Details" button on your task

![Details Button](./TestSnapshots/Test-3.1.png)

    2. Modal opens showing execution history
            You should see:
                    Start/End times
                    Duration
                    Output: "Deployment"

![Execution Details](./TestSnapshots/Test-3.2.png)

# Test4: Search
#Tasks in Task Manager

![Task Manager Before search](./TestSnapshots/Test-4.1.png)

    1. Type task name in search bar
    2. Press Enter or click search icon
    3. Table filters to matching tasks

![Task Manager After search](./TestSnapshots/Test-4.2.png)

# Test5: Delete
    1. Click "Delete" (trash icon) button

![Deletion Button](./TestSnapshots/Test-5.1.png)

    2. Confirm deletion

![Confirm Deletion](./TestSnapshots/Test-5.2.png)

    3. Task disappears from table

![Deletion Success](./TestSnapshots/Test-5.3.png)