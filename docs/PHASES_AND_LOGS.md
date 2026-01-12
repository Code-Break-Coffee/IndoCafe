# 🗺️ Development Roadmap & Change Logs

This document serves as the central "Todo" list for the IndoCafe project. It tracks high-level phases and granular feature progress.

## 🟢 Phase 1: Foundation (Completed)

_Core system setup, security, and basic administration._

- [x] **Project Setup**: Monorepo structure, Docker configuration, Linting/Prettier.
- [x] **Authentication**: JWT implementation, Password hashing, RBAC middleware.
- [x] **Database Design**: Schema definitions for Users, Outlets, MasterMenu.
- [x] **Protected Routes**: Client-side higher-order components for role-based redirects.
- [x] **Staff Onboarding**: Admin ability to create Outlet Managers; Managers creating operational staff.

## 🟡 Phase 2: Operations (In Progress)

_Internal tools for running the restaurant day-to-day._

- [x] **Menu Management**: Master catalog creation.
- [ ] **Menu Overrides**: Local outlet capabilities to toggle item availability/price.
- [ ] **Order Management**: Schema design for Orders (Dine-in/Delivery).
- [x] **Kitchen Display System (KDS)**: Real-time view for kitchen staff to manage active orders.
- [x] **Table Management**: Visual map or list of tables for Waiters.
- [ ] **Inventory Basics**: Tracking stock deduction based on menu items sold.
- [ ] **Profile Refactor**: Optimization of ProfileScreen and Image Uploads.
- [ ] **Bubble Navbar**: Custom bottom navigation implementation.

## 🔴 Phase 3: Customer Experience

_Public-facing interfaces and revenue generation._

- [ ] **Public Website**: Landing page for the restaurant brand.
- [ ] **Digital Menu**: Customer-viewable menu with rich media (Photos/Description).
- [ ] **Cart & Checkout**: persistent cart state, payment gateway integration (Stripe/Razorpay).
- [ ] **Real-time Tracking**: Socket.io integration for order status updates.
- [ ] **Customer Profile**: Order history, saved addresses, favorites.

## 🔴 Phase 4: Mobile Expansion

_Native experience and advanced features._

- [ ] **Android App**: Native Kotlin application for customers.
- [ ] **Advanced Delivery**: Rider assignment logic, Geofencing.
- [ ] **Loyalty Program**: Points accumulation and redemption logic.

---

## 📝 Change Logs

**[2024-01-XX] Initial Documentation**:

- Created `/docs` structure.
- Defined Role-based personas.
