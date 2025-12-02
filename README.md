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
