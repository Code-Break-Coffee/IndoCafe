# Testing Customer Order Flow

## Step-by-Step Test Instructions

### 1. Place Order as Customer

1. Open a **new browser tab** or **incognito window**
2. Navigate to: `http://localhost:5175/home`
3. **Select the SAME outlet** shown in waiter dashboard:
   - Outlet ID: `694b8c1d218505c52fcf83B86`
   - Make sure the outlet name matches what the waiter is viewing
4. Browse the menu and add items to cart
5. Click the cart icon (top right)
6. Click "Checkout" button
7. You should see: "Order Placed Successfully!" toast message

### 2. Verify in Waiter Dashboard

1. Go back to waiter dashboard tab: `http://localhost:5175/waiter`
2. Click "Pending Orders" tab (yellow/orange button)
3. Wait 10 seconds (or click the refresh button)
4. Order should appear with:
   - Yellow border
   - Order number
   - Items list
   - "Accept & Start Cooking" button

### 3. Accept the Order

1. Click "Accept & Start Cooking" button
2. Toast message: "Order accepted & sent to kitchen!"
3. Order moves from "Pending" to "Active Orders" tab

## Troubleshooting

### If order doesn't appear:

**Check Outlet Mismatch:**
- Customer outlet ID must match waiter outlet ID
- Look at the debug info box on waiter dashboard
- Note the outlet ID shown

**Verify Order Creation:**
Open browser console (F12) and check:
```
Network tab → Look for POST /api/public/orders
Should return: { success: true, data: {...} }
```

**Check Backend:**
In your terminal where server is running, you should see:
```
POST /api/public/orders 201
```

### Common Issues:

1. **No Menu Items Available**
   - Make sure menu items exist for the selected outlet
   - Admin must create menu items first

2. **Outlet Not Selected**
   - Home page should show "Select Location" button
   - Click it and choose an outlet

3. **Cart Empty**
   - Add at least one item before checkout

## Quick Test via API (Alternative)

If you want to test directly via API:

```bash
# Replace OUTLET_ID with the ID from waiter dashboard debug info
curl -X POST http://localhost:5000/api/public/orders \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": "694b8c1d218505c52fcf83B86",
    "items": [
      {
        "menuItem": "MENU_ITEM_ID_HERE",
        "quantity": 2
      }
    ],
    "totalAmount": 100
  }'
```

Should return:
```json
{
  "success": true,
  "data": { ... },
  "message": "Order placed successfully"
}
```

## Expected Flow

```
CUSTOMER (Home Page)
  ↓
Select Outlet → Browse Menu → Add to Cart → Checkout
  ↓
Order Created (status: 'placed', tableId: null)
  ↓
WAITER (Dashboard)
  ↓
"Pending Orders" tab shows order
  ↓
Click "Accept & Start Cooking"
  ↓
Order status → 'cooking'
  ↓
Appears in "Active Orders" tab
```
