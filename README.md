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

Plain HTML, CSS, vanilla JS, Bootstrap. No build step, no package manager, no backend.

## Run locally

Serve the folder with any static server, e.g.:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/index.html`.
