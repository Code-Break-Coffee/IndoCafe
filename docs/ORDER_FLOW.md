# Order Flow Documentation

## Overview
The Indo Cafe ordering system now supports multiple order types:
1. **Customer Placed Orders** - Customers order from the home page (delivery/takeaway)
2. **Table Orders** - Waiters take orders directly from dine-in tables  
3. **Counter Orders** - Managers/Waiters can input walk-in orders

---

## Complete Order Lifecycle

```
CUSTOMER ORDER (Home Page)
    ↓
[Placed] - Customer places order via home page cart
    ↓
[Pending Tab - Waiter/Manager View] - Appears in "Pending Orders" 
    ↓
[Cooking] - Waiter/Manager clicks "Accept & Start Cooking"
    ↓
[Ready] - Kitchen marks as ready
    ↓
[Delivered] - Waiter marks as "Mark Served/Delivered"


TABLE ORDER (Dine-In)
    ↓
[Placed] - Waiter takes order for table via TakeOrderModal
    ↓
[Cooking] - Waiter clicks "Accept & Start Cooking" (if needed) or auto-flows
    ↓
[Ready] - Kitchen marks as ready
    ↓
[Delivered] - Waiter marks as "Mark Served"
```

---

## 1. Customer Places Order (Home Page)

### Steps:
1. Customer navigates to home page
2. Selects outlet location
3. Browses menu → Adds items to cart
4. Cart shows total → Click "Checkout"
5. Order is submitted via `/api/public/orders` endpoint

### Order Details Created:
- `outletId` - Which outlet the order is for
- `items` - Array of menu items with quantities
- `totalAmount` - Total price
- `status` - Set to **'placed'** (awaiting acceptance)
- `tableId` - NULL (not a dine-in order)

### API Endpoint:
```bash
POST /api/public/orders
{
  "outletId": "outlet_id",
  "items": [
    {
      "menuItem": "item_id",
      "quantity": 2,
      "modifiers": ["No Onion"]
    }
  ],
  "totalAmount": 450.00
}
```

---

## 2. Waiter Dashboard - Pending Orders Tab

### New Feature: "Pending Orders" Tab
- Shows all customer orders waiting to be accepted
- Filters: `status === 'placed' && tableId === null`
- Yellow highlight badge shows count

### What Waiters See:
- Order number (last 4 digits of ID)
- List of items with quantities
- Order total
- Time elapsed since order placed
- **"Accept & Start Cooking" Button** - NEW!

### Actions Available:
1. **Accept & Start Cooking** - Changes status to 'cooking' → Order sent to kitchen
2. **Refresh** - Click refresh button to see new pending orders

### Benefits:
- Waiters can accept orders from home page before kitchen sees them
- Clear separation from dine-in table orders
- Reduces confusion between different order types

---

## 3. Manager's Live Orders Dashboard

### "New Orders" Column (Already Existed - Enhanced)
- Shows all orders with `status === 'placed'`
- Includes both:
  - Customer orders from home page
  - Any table orders marked as placed
- Each order shows: Time, items, total

### Actions Available for Managers:
1. **Mark cooking** - Accepts the order → Kitchen starts cooking
2. **Refresh** - Updates order board immediately

### Use Case:
Managers can accept pending orders if waiters haven't, or override waiter decisions

---

## 4. Kitchen Dashboard 

### Kitchen Views:
1. **"Pending" Section** - Shows `status === 'placed'` orders
   - These are new orders just received
   - Kitchen clicks "Start Cooking" to accept
2. **"Cooking" Section** - Shows `status === 'cooking'` orders
   - Orders currently being prepared
   - Kitchen clicks "Mark Ready" when done

### Kitchen Actions:
- **Start Cooking** → Changes 'placed' to 'cooking'
- **Mark Ready** → Changes 'cooking' to 'ready'

---

## 5. Back to Waiter - Ready & Delivery

### Active Orders Tab - Shows All Order States
- Displays all orders (placed, cooking, ready, out_for_delivery)
- Color-coded by status:
  - 🟨 Yellow = Placed
  - 🟧 Orange = Cooking
  - 🟩 Green = Ready
  - 🟦 Blue = Out for Delivery

### When Order is Ready:
- "Mark Served / Delivered" button appears (green)
- Waiter clicks to complete the order
- Order status → 'delivered'

### Occupied Tables Sidebar:
- Shows which tables are currently occupied
- Waiter can add more orders to the same table
- Tables are freed up when all orders are delivered

---

## 6. Order Status Transitions

### Valid Status Flow:
```
placed → cooking → ready → (out_for_delivery) → delivered
          ↓
        cancelled (at any point)
```

### Invalid Transitions:
- Cannot jump from 'placed' to 'ready' (must go through 'cooking')
- Cannot go backwards (e.g., 'ready' → 'cooking')

---

## 7. Database Model Updates

### Order Schema Fields (Relevant to Flow):
```javascript
{
  outletId,          // Which location
  items: [
    {
      menuItem,      // Reference to menu item
      quantity,      // How many
      modifiers      // Special requests
    }
  ],
  totalAmount,       // Final price
  status,            // 'placed' | 'cooking' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
  tableId,           // NULL for delivery/takeaway, ObjectId for dine-in
  notes,             // Special instructions (e.g., "no onions")
  takenBy,           // Waiter/staff who took the order
  createdAt,         // When order was placed
  updatedAt          // Last status change
}
```

---

## 8. User Roles & Permissions

### Who Can Accept Orders:
- ✅ OUTLET_MANAGER - Can accept any order
- ✅ WAITER - Can accept any order
- ✅ SUPER_ADMIN - Can accept any order
- ❌ CUSTOMER - Cannot
- ❌ KITCHEN - Cannot accept (only change to cooking/ready)

### What Each Role Does:

| Role | Create | Accept | Cook | Ready | Serve |
|------|--------|--------|------|-------|-------|
| Customer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Waiter | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manager | ✅ | ✅ | ❌ | ❌ | ✅ |
| Kitchen | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## 9. Testing Checklist

- [ ] Customer places order from home page
- [ ] Order appears in Waiter's "Pending Orders" tab
- [ ] Waiter clicks "Accept & Start Cooking"
- [ ] Order appears in Kitchen's "Cooking" section
- [ ] Kitchen marks order as "Ready"
- [ ] Order appears in Waiter's "Active Orders" with green badge
- [ ] Waiter clicks "Mark Served"
- [ ] Order disappears from active lists
- [ ] Manager can also accept pending orders from "New Orders" column
- [ ] Order notes display correctly
- [ ] Order items and totals are accurate
- [ ] Auto-refresh updates dashboards every 10-15 seconds

---

## 10. API Endpoints Used

### Order Management:
```
POST   /api/public/orders                    # Create order (customer)
GET    /api/manager/orders/:outletId         # Fetch orders
PUT    /api/manager/orders/:id/status        # Update status
```

### Table Management:
```
GET    /api/waiter/tables/:outletId          # Get all tables
GET    /api/waiter/table/:tableId/orders     # Get table's orders
POST   /api/waiter/tables/:id/reserve        # Reserve table
POST   /api/waiter/tables/:id/release        # Release table
```

### Status Query:
```
?status=active        # Fetch placed, cooking, ready, out_for_delivery
?status=placed        # Fetch only pending orders
```

---

## 11. Future Enhancements

1. **Real-time Updates** - WebSocket instead of 10-15s polling
2. **Order Printer** - Print orders automatically in kitchen
3. **Customer Tracking** - Show delivery status on home page
4. **Analytics** - Track average prep time, popular items
5. **Multi-outlet Delivery** - Route orders to nearest kitchen
6. **Estimated Time** - Show ETA based on queue length
7. **Order Customization** - Allow customers to modify after placing

---

## Notes:
- All timestamps are in milliseconds (JavaScript standard)
- Order IDs are MongoDB ObjectIds (truncated to last 4 digits for display)
- Color scheme helps staff quickly identify order status
- Auto-refresh every 10s prevents manual refreshes
