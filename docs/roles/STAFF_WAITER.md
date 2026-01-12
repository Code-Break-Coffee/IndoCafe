# 🤵 Role: Waiter / POS Operator

## 👤 User Persona

**Who are they?**
Waitstaff serving Dine-in customers, or a Cashier at the counter. They are mobile, moving between tables, and need speed.
**Key Design Requirement**: Mobile-first design (for tablets/phones). Fast data entry.

## 🔐 Access Level

- **Routes**: `/pos/*`, `/orders/*`
- **Capabilities**: Create Orders, take Payments, Modify Orders (add items), Table Management.
- **Restrictions**: Limited void/refund capabilities (requires Manager approval).

## 🛠️ Key Features & Implementation Status

| Feature              | Description                                                                        | Status         |
| :------------------- | :--------------------------------------------------------------------------------- | :------------- |
| **Visual Table Map** | Layout of the restaurant indicating Occupied/Free/Reserved tables.                 | ✅ **Done**    |
| **Order Taking**     | Fast search to add items to a table's bill. Supports modifiers (e.g., "No Onion"). | ⚠️ **Partial** |
| **Order Status**     | Real-time updates when Kitchen marks food as "Ready".                              | ✅ **Done**    |
| **Bill Splitting**   | Functionality to split the bill by item or by head count.                          | ❌ **To Do**   |
| **Payments**         | Integration with Card Terminals or Cash entry.                                     | ❌ **To Do**   |

## 🔄 Daily Workflow

1.  **Guest Arrival**: Tap "Table 5" on the map -> Set to "Occupied".
2.  **Order Taking**: Guests want drinks. Select Table 5 -> Search "Coke", "Water" -> Send to Kitchen.
3.  **Service**: Notification "Table 5 Drinks Ready" -> Pick up from bar -> Serve.
4.  **Append**: Guests typically order main course later. Open Table 5 again -> Add "Steak", "Pasta" -> Send.
5.  **Payment**: Guests ask for bill. Print Bill -> Present -> Accept Card Payment -> Mark Table as "Clean/Free".
