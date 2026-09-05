# LearnSphere : Online Courses

Full-stack e-learning platform: multi-page HTML/CSS/JS frontend + Express/MongoDB backend. Course browsing, cart/wishlist/enrollment, a lecture player, reviews, and JWT auth — all backed by real API endpoints, not just `localStorage`.

## Features

**Auth & session**
- Signup/login with JWT (`auth.js`), navbar shows a logged-in user menu (avatar + name + logout) instead of a generic icon
- Expired/invalid tokens are detected automatically (any `401`) — user is signed out and redirected to login instead of the page silently breaking
- Password visibility toggle (eye icon) on login/signup, signup password strength meter (`password-strength.js`)

**Courses & learning**
- Course browsing with search, price and level filters, and a "Clear filters" empty state (`course-filter.js`)
- Course detail page (`course-detail.js`) — tabbed Overview/Curriculum/Instructor/Reviews, sticky mini-header on scroll, sticky mobile "Enroll Now" bar
- Full-screen lecture player (`learn.html`, `player.js`) — 4-part curriculum shell, progress tracked server-side, certificate on completion
- Recently viewed courses, shown on both `courses.html` and `index.html` (`recently-viewed.js`)
- Downloadable completion certificate generated on a `<canvas>` (`certificate.js`)

**Cart, wishlist, reviews**
- Cart, wishlist and enrollment/progress — all server-backed per logged-in user (`cart.js`, `wishlist.js`)
- Circular progress ring + pulsing badge count on add
- Course reviews tied to the logged-in user (`reviews.js`)
- Checkout validates the actual server response before showing success — no false "Order Placed!" on a failed charge

**Resilience**
- Every list/dashboard shows a skeleton loader while fetching, then a distinct "couldn't reach the server" state with Retry if the backend is down — never a silent blank screen
- Toast notifications (`toast.js`), capped at 3 visible at once so spam-clicking can't stack dozens

**Student dashboard & instructor page**
- Student dashboard: gradient hero, personalized greeting, stat cards, per-course progress rings, "Continue Learning" into the player
- Instructor page: apply-as-instructor marketing page with a working validated modal form

**Site-wide**
- Custom branded `404.html`
- Responsive down to 375px — 2-column course/category grids on mobile, fixed sticky footer button overlap, player top bar reflow
- Page fade-in, button ripple, and other small transitions

## Pages

- `index.html` — home
- `courses.html` / `single.html` — course listing / course detail
- `learn.html` — full-screen lecture player
- `cart.html`, `checkout.html`, `wishlist.html`
- `login.html`, `signup.html`
- `dashboard.html`, `instructor.html`
- `about.html`, `contact.html`, `faq.html`, `testimonial.html`, `privacy.html`, `terms.html`
- `404.html`

## Structure

- `frontend/` — all static site files
  - `*.html` — pages
  - `css/` — Bootstrap + custom styles (`style.css`, `player.css`)
  - `scss/` — Bootstrap SCSS source
  - `js/` — page logic (cart, wishlist, course filter/detail, player, reviews, auth, toast, etc.)
  - `lib/` — third-party libs (owlcarousel, wow, animate, easing, waypoints)
  - `img/` — images/icons
- `backend/` — Express + MongoDB API

## Stack

Frontend: plain HTML, CSS, vanilla JS, Bootstrap. No build step.
Backend: Node.js + Express + MongoDB (Mongoose), JWT auth.

## Backend (`backend/`)

Express + MongoDB API. Auth, cart, wishlist, enrollment and posting reviews are JWT-protected; reading reviews, contact, and newsletter signup are public. The server starts even without `MONGODB_URI` set — routes that don't touch the DB still work, DB-dependent ones fail gracefully.

- `server.js` — Express app entry
- `models/` — `User`, `Cart`, `Wishlist`, `Enrollment`, `Review`, `ContactMessage`, `Subscriber`
- `middleware/auth.js` — JWT verification, sets `req.userId`
- `routes/auth.js` — `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `routes/cart.js` — `GET/POST /api/cart`, `DELETE /api/cart/:title`, `POST /api/cart/checkout` (moves cart items into enrollments)
- `routes/wishlist.js` — `GET /api/wishlist`, `POST /api/wishlist/toggle`, `DELETE /api/wishlist/:title`
- `routes/enrollment.js` — `GET /api/enrollment`, `PATCH /api/enrollment/:title/progress` (optional `{ amount }` in body, defaults to 10)
- `routes/reviews.js` — `GET /api/reviews/:courseId` (public), `POST /api/reviews/:courseId` (auth required)
- `routes/contact.js` — `POST /api/contact` (public, stores the message)
- `routes/newsletter.js` — `POST /api/newsletter` (public, dedupes by email) — currently unused by the frontend (Subscribe is a `mailto:` link instead), kept for future use

### Setup

```bash
cd backend
npm install
cp .env.example .env   # set MONGODB_URI and JWT_SECRET
npm start
```

Runs on `http://localhost:5000`. Auth/cart/wishlist/enrollment/reviews/contact need a MongoDB instance (local or Atlas) — set `MONGODB_URI` in `.env`.

## Run locally

Frontend — serve the `frontend/` folder with any static server:

```bash
cd frontend
python3 -m http.server 8080
```

Open `http://localhost:8080/index.html`. Auth, cart, wishlist, dashboard, reviews, and contact all call the backend at `http://localhost:5000`, so start the backend too for those to work — otherwise they show a "couldn't reach the server" state with a Retry button.

### 404 page

`frontend/404.html` is a branded not-found page. A static file alone doesn't intercept unmatched routes — that's server config, and depends on where you deploy:

- **Netlify**: add a `_redirects` file with `/* /404.html 404`
- **Apache**: `ErrorDocument 404 /404.html`
- **Nginx**: `error_page 404 /404.html;`
- **`python -m http.server`** (used above for local dev) doesn't support this at all — 404s during local dev show the plain default page.
