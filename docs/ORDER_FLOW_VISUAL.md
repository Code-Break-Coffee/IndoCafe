# Order Flow Visual Guide

## 🎯 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INDO CAFE ORDER SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                      1. CUSTOMER ORDERS (Home Page)                       │
└───────────────────────────────────────────────────────────────────────────┘

    Customer
       │
       ├─► Browse Menu (Home Page)
       │
       ├─► Add Items to Cart
       │
       └─► Click "Checkout"
             │
             └─► POST /api/public/orders
                   {
                     outletId: "...",
                     items: [...],
                     totalAmount: 450,
                     status: "placed"   ← Order created
                   }


┌───────────────────────────────────────────────────────────────────────────┐
│              2. WAITER ACCEPTS ORDER (Pending Orders Tab)                 │
└───────────────────────────────────────────────────────────────────────────┘

    Waiter Dashboard
       │
       ├─► View "Pending Orders" Tab (Yellow Badge) 🟨
       │      │
       │      ├─ Shows orders with:
       │      │  • status === 'placed'
       │      │  • tableId === null (customer orders)
       │      │
       │      └─ Order Card displays:
       │         ├─ Order #1234
       │         ├─ Items (2x Pizza, 1x Burger)
       │         ├─ Total: $45.00
       │         ├─ Time: 2m ago ⏱️
       │         └─ [Accept & Start Cooking] Button 🔵
       │
       └─► Click "Accept & Start Cooking"
             │
             └─► PUT /api/manager/orders/:id/status
                   { status: "cooking" }   ← Order accepted


┌───────────────────────────────────────────────────────────────────────────┐
│            3. MANAGER VIEW (Live Orders Dashboard) - PARALLEL             │
└───────────────────────────────────────────────────────────────────────────┘

    Manager Dashboard → Live Orders
       │
       ├─── Column 1: "New Orders" (Blue) 🔵
       │      │
       │      ├─ Shows ALL 'placed' orders
       │      │  (Customer + Table orders)
       │      │
       │      └─ Each card has:
       │         ├─ Order details
       │         └─ [Mark cooking] Button
       │
       ├─── Column 2: "Preparing" (Orange) 🟧
       │      │
       │      ├─ Shows 'cooking' orders
       │      └─ [Mark ready] Button
       │
       └─── Column 3: "Ready" (Green) 🟩
              │
              ├─ Shows 'ready' orders
              └─ [Mark delivered] Button


┌───────────────────────────────────────────────────────────────────────────┐
│                  4. KITCHEN PREPARES ORDER (KDS)                          │
└───────────────────────────────────────────────────────────────────────────┘

    Kitchen Dashboard
       │
       ├─── Left Panel: "Pending" (Blue) 🔵
       │      │
       │      ├─ Shows 'placed' orders
       │      └─ [Start Cooking] Button
       │            │
       │            └─► Changes status to 'cooking'
       │
       └─── Right Panel: "Cooking" (Orange) 🟧
              │
              ├─ Shows 'cooking' orders
              └─ [Mark Ready] Button 🍽️
                    │
                    └─► PUT /api/manager/orders/:id/status
                          { status: "ready" }   ← Food is ready!


┌───────────────────────────────────────────────────────────────────────────┐
│               5. WAITER DELIVERS ORDER (Active Orders Tab)                │
└───────────────────────────────────────────────────────────────────────────┘

    Waiter Dashboard → Active Orders Tab
       │
       ├─► Order Card shows:
       │     │
       │     ├─ Status Badge: "READY" (Green) 🟩
       │     ├─ Order details
       │     ├─ Items list
       │     └─ [Mark Served / Delivered] Button 🎯
       │
       └─► Click "Mark Served / Delivered"
             │
             └─► PUT /api/manager/orders/:id/status
                   { status: "delivered" }   ← Order complete! ✅


┌───────────────────────────────────────────────────────────────────────────┐
│                         STATUS COLOR CODES                                │
└───────────────────────────────────────────────────────────────────────────┘

    🟨 PLACED            - Order received, awaiting acceptance
    🟧 COOKING           - Kitchen is preparing
    🟩 READY             - Food ready for pickup/delivery
    🟦 OUT_FOR_DELIVERY  - Rider has picked up order
    ✅ DELIVERED         - Order complete
    ❌ CANCELLED         - Order cancelled


┌───────────────────────────────────────────────────────────────────────────┐
│                      TABLE ORDERS (Dine-In) FLOW                          │
└───────────────────────────────────────────────────────────────────────────┘

    Waiter
       │
       ├─► Select Table from "My Tables" tab
       │
       ├─► Click [+ Order] Button
       │
       └─► TakeOrderModal opens
             │
             ├─ Browse menu
             ├─ Add items
             ├─ Add notes ("No onions")
             └─ Submit Order
                   │
                   └─► POST /api/public/orders
                         {
                           tableId: "table_123",  ← Linked to table
                           items: [...],
                           notes: "No onions",
                           status: "placed"
                         }
                         │
                         └─ Follows same flow as customer orders
                            (Pending → Cooking → Ready → Delivered)


┌───────────────────────────────────────────────────────────────────────────┐
│                       AUTO-REFRESH TIMERS                                 │
└───────────────────────────────────────────────────────────────────────────┘

    • Waiter Dashboard:  Refreshes every 10 seconds 🔄
    • Manager Dashboard: Refreshes every 15 seconds 🔄
    • Kitchen Dashboard: Refreshes every 10 seconds 🔄

    → Ensures real-time order tracking without manual refresh!


┌───────────────────────────────────────────────────────────────────────────┐
│                          API ENDPOINTS SUMMARY                            │
└───────────────────────────────────────────────────────────────────────────┘

    Orders:
    ┌─────────────────────────────────────────────────────────────────┐
    │ POST   /api/public/orders                    Create new order   │
    │ GET    /api/manager/orders/:outletId         Get outlet orders  │
    │ PUT    /api/manager/orders/:id/status        Update status      │
    └─────────────────────────────────────────────────────────────────┘

    Tables:
    ┌─────────────────────────────────────────────────────────────────┐
    │ GET    /api/waiter/tables/:outletId          Get all tables     │
    │ GET    /api/waiter/table/:tableId/orders     Get table orders   │
    │ POST   /api/waiter/tables/:id/reserve        Reserve table      │
    │ POST   /api/waiter/tables/:id/release        Release table      │
    └─────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────────┐
│                     KEY FEATURES & BENEFITS                               │
└───────────────────────────────────────────────────────────────────────────┘

    ✅ Customer Self-Service
       → Customers can order directly from home page
       → No staff required for order placement

    ✅ Clear Order Separation
       → Customer orders (no tableId) in "Pending Orders" tab
       → Dine-in orders (with tableId) shown separately
       → Reduces confusion between order types

    ✅ Flexible Order Acceptance
       → Waiters can accept via "Pending Orders" tab
       → Managers can accept via "New Orders" column
       → Kitchen can also accept (Start Cooking)
       → Multiple staff can handle orders efficiently

    ✅ Real-Time Tracking
       → Auto-refresh keeps dashboards updated
       → Color-coded status badges for quick identification
       → Time elapsed shows order age

    ✅ Complete Order History
       → Each table maintains order history
       → Tracks all orders from placement to delivery
       → Useful for billing and analytics


┌───────────────────────────────────────────────────────────────────────────┐
│                     TROUBLESHOOTING TIPS                                  │
└───────────────────────────────────────────────────────────────────────────┘

    ❓ Order not appearing in Pending Tab?
       → Check if tableId is NULL (customer orders only)
       → Verify outlet is selected
       → Wait for auto-refresh or click Refresh button

    ❓ Can't accept order?
       → Ensure you're logged in as Waiter/Manager
       → Check order status is 'placed'
       → Verify API endpoint permissions

    ❓ Order stuck in one status?
       → Check kitchen dashboard - may need to update
       → Verify status transition is valid (placed → cooking → ready)
       → Check console for API errors

    ❓ Multiple orders not showing?
       → Check status query parameter
       → Verify outlet filtering
       → Ensure database connection is active
