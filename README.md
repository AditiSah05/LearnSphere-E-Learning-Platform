# LearnSphere : Online Courses

Static front-end e-learning platform template. Multi-page HTML/CSS/JS site: course browsing, cart, wishlist, checkout, instructor and student dashboards, auth pages.

## Features

- Course browsing with search, price and level filters (`course-filter.js`)
- Course detail page (`course-detail.js`, `courses-data.js`)
- Cart and enrollment tracked via `localStorage` (`cart.js`)
- Wishlist, saved to `localStorage` (`wishlist.js`)
- Recently viewed courses, `localStorage`-backed (`recently-viewed.js`)
- Course reviews/ratings, persisted in `localStorage` (`reviews.js`)
- Downloadable completion certificate generated on a `<canvas>` (`certificate.js`)
- Signup password strength meter (`password-strength.js`)
- Client-side form validation (`form-validation.js`), contact form handling (`contact-form.js`)
- Toast notifications (`toast.js`)
- Student dashboard and instructor dashboard pages
- Checkout flow

## Pages

- `index.html` — home
- `courses.html` / `single.html` — course listing / course detail
- `cart.html`, `checkout.html`, `wishlist.html`
- `login.html`, `signup.html`
- `dashboard.html`, `instructor.html`
- `about.html`, `team.html`, `contact.html`, `faq.html`, `testimonial.html`, `privacy.html`, `terms.html`

## Structure

- `css/` — Bootstrap + custom styles (`style.css`)
- `scss/` — Bootstrap SCSS source
- `js/` — page logic (cart, wishlist, course filter/detail, reviews, form validation, toast, etc.)
- `lib/` — third-party libs (owlcarousel, wow, animate, easing, waypoints)
- `img/` — images/icons

## Stack

Frontend: plain HTML, CSS, vanilla JS, Bootstrap. No build step.
Backend: Node.js + Express + MongoDB (Mongoose), JWT auth.

## Backend (`backend/`)

Express + MongoDB API: auth, cart/enrollment, wishlist, reviews — all per-user, JWT-protected (except auth and reading reviews).

- `server.js` — Express app entry
- `models/` — `User`, `Cart`, `Wishlist`, `Enrollment`, `Review` (Mongoose schemas)
- `middleware/auth.js` — JWT verification, sets `req.userId`
- `routes/auth.js` — `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `routes/cart.js` — `GET/POST /api/cart`, `DELETE /api/cart/:title`, `POST /api/cart/checkout` (moves cart items into enrollments)
- `routes/wishlist.js` — `GET /api/wishlist`, `POST /api/wishlist/toggle`, `DELETE /api/wishlist/:title`
- `routes/enrollment.js` — `GET /api/enrollment`, `PATCH /api/enrollment/:title/progress`
- `routes/reviews.js` — `GET /api/reviews/:courseId` (public), `POST /api/reviews/:courseId` (auth required)

Frontend cart/wishlist/reviews pages now call these endpoints instead of `localStorage`, and redirect to `login.html` if the visitor isn't logged in.

### Setup

```bash
cd backend
npm install
cp .env.example .env   # set MONGODB_URI and JWT_SECRET
npm start
```

Runs on `http://localhost:5000`. Requires a MongoDB instance (local or Atlas).

## Run locally

Frontend — serve the repo root with any static server:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/index.html`. `login.html` and `signup.html` call the backend at `http://localhost:5000/api/auth`, so start the backend too for real accounts.
