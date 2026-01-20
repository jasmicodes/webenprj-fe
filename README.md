# 🎓 Motivise – Study Micro-Blogging Platform (Frontend)

Motivise is a modern **Vue 3 Single Page Application (SPA)** built with **Vite**, **Pinia**, **Axios** and **TailwindCSS**.  
It’s part of the WEBEN course project at _FH Technikum Wien_ and complements the Motivise **Spring Boot backend**.

## 🌟 Main Idea

Students can post short updates about what they studied today –  
similar to a micro-blog that motivates and connects learners.

Each post may contain:

- ✏️ a short learning note
- 🖼️ an image or PDF attachment
- 🏷️ study tags (e.g. `#math`, `#marketing`)
- 💬 comments and likes
- 🔥 (if there will be enough time: “study streaks”)

Administrators can manage users, roles and posts.

## 👥 User Roles & Permissions

The application distinguishes between three user roles:

### 👤 Unregistered User

- View public posts on the homepage
- Register for a new account
- Log in to the platform

### 🙋 Registered User

- Create, edit and delete own posts
- Upload images or PDFs to posts
- Like and comment on posts
- Manage personal profile and profile image
- Bookmark posts and organize them into collections

### 🛠️ Administrator

- View and manage all users
- Change user roles
- Lock or delete user accounts
- View and moderate all posts

## 🧩 Tech Stack

| Layer            | Technology                                            |
| :--------------- | :---------------------------------------------------- |
| Framework        | Vue 3 + Vite                                          |
| State Management | Pinia                                                 |
| HTTP Client      | Axios                                                 |
| Validation       | Yup                                                   |
| Styling          | Tailwind CSS v4 + custom design tokens                |
| Architecture     | Atomic Design (Atoms → Molecules → Organisms → Views) |
| Auth             | JWT-based via backend                                 |
| Accessibility    | Checked with Google Lighthouse & validator.w3.org     |

## 📦 Core Resources

The frontend works with the following main resources provided by the backend API:

- **User**
  - id, username, email, role, profileImage
- **Post**
  - id, content, tags, imageUrl, createdAt, createdBy
- **Comment**
  - id, content, postId, createdBy
- **Bookmark**
  - id, postId, userId
- **Collection**
  - id, title, bookmarks

Each resource supports CRUD operations depending on the user role.

## 🚀 Quick Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/VI-Acid/webenprj-fe
cd webenprj-fe
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run development server

```bash
npm run dev
```

### 4️⃣ Connect to backend

Make sure the backend (Motivise – Backend) runs at http://localhost:8081
You can adjust the base URL in src/services/api.ts → API_BASE_URL.

## 🌐 Access Overview

| Service                   | URL                                         |
| :------------------------ | :------------------------------------------ |
| Frontend App              | http://localhost:5173                       |
| Backend API               | http://localhost:8081                       |
| Swagger UI (Backend Docs) | http://localhost:8081/swagger-ui/index.html |

## 🧭 Project Structure

```bash
src/
├─ assets/            # images, icons, logo, main.css
├─ components/
│   ├─ atoms/         # Base components (buttons, inputs, icons …)
│   ├─ molecules/     # Small UI groups (SearchBar, AuthForm …)
│   └─ organisms/     # Larger blocks (Navbar, PostCard …)
├─ data/              # Demo data for Posts
├─ router/            # Vue Router configuration
├─ services/          # api.ts - Axios helper + API base config
├─ stores/            # Pinia stores (userStore)
├─ types/             # Interfaces + Types
├─ utils/             # Static Data - DACH Countries
├─ views/             # Pages / routes (Home, Login, Register …)
├─ main.ts            # App bootstrap
└─ App.vue            # Single Page Application
```

## 🖥️ Screen / View Overview

The application consists of the following main views:

- **HomeView** – public feed of posts
- **LoginView** – user authentication
- **RegisterView** – account creation
- **ExploreView** – search for posts and users
- **PostDetailView** – detailed view of a single post
- **ProfileView** – personal profile management
- **UserProfileView** – public user profiles
- **BookmarksView** – saved posts and collections
- **AdminDashboardView** – user and content administration
- **SettingsView** – account-related settings

## 🔄 Basic User Flow

1. Visitor opens the homepage and views public posts
2. Visitor registers via the registration form
3. User logs in and receives a JWT token
4. Authenticated user creates a post with text, tags and optional media
5. Other users can like, comment or bookmark the post
6. Admin users can manage users and moderate content

## 📝 Registration Overview

The registration view (RegisterView.vue) handles the user interface and the communication with the backend.

### 1. Form Validation and Payload

The registration form uses the Yup library for validating user inputs. After successful validation, the payload is sent to the backend via:

TypeScript

authApi.register({
email,
username,
password,
countryCode,
profileImageUrl: undefined,
})

### 2. Centralized API Communication

All API calls, including registration, go through the centralized Axios instance (src/services/api.ts). This instance ensures consistent API behavior and handles the following:

Base URL: Uses http://localhost:8081.

Headers: Ensures JSON headers are set.

JWT Attachment: Automatically attaches the JWT (if present) for authenticated requests.

Error Handling: Provides a unified error extraction mechanism (unified error extraction) for displaying Toast messages.

Upon successful registration, the user is redirected to the /login route.

### 3. Country Selection (ISO Codes) 🌍

The country selection is implemented via a dropdown list that utilizes data from COUNTRIES_DACH_FIRST (src/utils/countries.ts).

Data Structure: The country data is structured in the following format:

TypeScript

{ code: "AT", label: "Austria" }

Binding: The <select> element binds the ISO code as its value:

<option v-for="c in COUNTRIES_DACH_FIRST" :key="c.code" :value="c.code">
  {{ c.label }}
</option>

This guarantees that the backend receives a valid ISO 3166-1 alpha-2 country code in the format {"countryCode": "AT"}. This code meets the backend validation requirement (^[A-Z]{2}$).
