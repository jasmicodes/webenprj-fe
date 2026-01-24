# Motivise – Frontend

Vue 3 SPA for the Motivise study micro-blogging platform. Built for the WEBEN course at FH Technikum Wien.

Students post short updates about what they're studying – text, images, PDFs, tags. Others can like, comment, and bookmark.

## Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Framework        | Vue 3 + Vite                              |
| State            | Pinia                                     |
| HTTP             | Axios                                     |
| Validation       | Yup                                       |
| Styling          | Tailwind CSS v4                           |
| Architecture     | Atomic Design (atoms/molecules/organisms) |

## Setup

```bash
git clone https://github.com/VI-Acid/webenprj-fe
cd webenprj-fe
npm install
npm run dev
```

Backend needs to run at `http://localhost:8081` (see backend README).

## URLs

| Service     | URL                                         |
| ----------- | ------------------------------------------- |
| Frontend    | http://localhost:5173                       |
| Backend API | http://localhost:8081                       |
| Swagger     | http://localhost:8081/swagger-ui/index.html |

## Project Structure

```
src/
├── assets/          # CSS, images, logo
├── components/
│   ├── atoms/       # BaseButton, BaseInput, etc.
│   ├── molecules/   # SearchBar, AuthForm, etc.
│   └── organisms/   # Navbar, PostCard, etc.
├── views/           # Page components (HomeView, LoginView, ...)
├── router/          # Vue Router config
├── stores/          # Pinia stores
├── services/        # API clients (Axios)
├── types/           # TypeScript interfaces
└── utils/           # Helpers, country data
```

## Views

- **HomeView** – post feed
- **LoginView** / **RegisterView** – auth
- **ExploreView** – search posts and users
- **PostDetailView** – single post with comments
- **ProfileView** – own profile
- **UserProfileView** – other users' profiles
- **BookmarksView** – saved posts, collections
- **AdminDashboardView** – user/post management (admin only)
- **SettingsView** – account settings

## User Roles

**Unregistered**: View posts, register, login

**Registered**: Create/edit/delete own posts, upload media, like, comment, bookmark

**Admin**: Manage all users and posts, change roles, lock accounts
