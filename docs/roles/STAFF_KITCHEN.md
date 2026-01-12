# 👨‍🍳 Role: Kitchen Staff

## 👤 User Persona

**Who are they?**
Chefs, Line Cooks, and Expediters working in a hot, noisy, high-pressure environment. They likely have wet or greasy hands.
**Key Design Requirement**: Buttons must be **LARGE**. UI should be high-contrast. Minimal clicking/typing required.

## 🔐 Access Level

- **Routes**: `/kitchen/*`
- **Capabilities**: View active orders, change order status (Prep -> Cooking -> Ready).
- **Restrictions**: Cannot access Admin/Manager configurations. Cannot process payments.

## 🛠️ Key Features & Implementation Status

| Feature                          | Description                                                                                                         | Status       |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :----------- |
| **KDS (Kitchen Display System)** | A Kanban-style board showing active tickets. Configurable by station (e.g., "Grill Station" only sees Grill items). | ✅ **Done**  |
| **Ticket Timer**                 | visual indicator (Green/Yellow/Red) showing how long an order has been waiting.                                     | ✅ **Done**  |
| **Status Toggling**              | Single-tap to move item from "Pending" to "Ready".                                                                  | ✅ **Done**  |
| **Recipe Viewer**                | Quick access to standard operating procedures/recipes for items.                                                    | ❌ **To Do** |
| **Waste Logging**                | Quickly button to log "Dropped/Spoiled" items for inventory tracking.                                               | ❌ **To Do** |

## 🔄 Daily Workflow

1.  **Station Setup**: Log in to the tablet mounted at the Grill Station.
2.  **Service**: A new ticket appears with a loud "Ping". It shows "2x Burgers".
3.  **Process**:
    - Tap "Accept" (Status -> Cooking).
    - Cook the burgers.
    - Tap "Ready" (Status -> Ready). This notifies the Waiter/Dispatcher.
4.  **Closing**: Log any unused prep or waste at the end of the shift.
