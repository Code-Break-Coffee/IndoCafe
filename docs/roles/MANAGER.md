# 👔 Role: Outlet Manager

## 👤 User Persona

**Who are they?**
The person responsible for a _specific_ physical or cloud kitchen location. They bridge the gap between the chaotic kitchen/service operations and the high-level business goals. They are practical, busy, and need tools that save time.

## 🔐 Access Level

- **Routes**: `/manager/*`, `/kitchen/*` (read-only usually), `/pos/*` (to assist).
- **Capabilities**: Manage their specific outlet's staff, local menu pricing/availability, inventory, and shift scheduling.
- **Restrictions**: Cannot see data from _other_ outlets. Cannot delete the Master Menu items (only hide them).

## 🛠️ Key Features & Implementation Status

| Feature                   | Description                                                                | Status             |
| :------------------------ | :------------------------------------------------------------------------- | :----------------- |
| **Staff Onboarding**      | Create accounts for Kitchen Staff, Waiters, and Riders for _their_ outlet. | ✅ **Done**        |
| **Menu Overrides**        | Mark master items as "Out of Stock" locally or change local price.         | ⚠️ **In Progress** |
| **Shift Management**      | Assign rosters for the week; track clock-in/out.                           | ❌ **To Do**       |
| **Inventory Management**  | Log daily stock levels; set low-stock alerts.                              | ❌ **To Do**       |
| **Daily Reports**         | "EOD" (End of Day) report generation (Sales vs Cost).                      | ❌ **To Do**       |
| **Refunds/Cancellations** | Authority to approve voids or refunds requested by waiters/cashiers.       | ❌ **To Do**       |
| **Price Edit Request Approve by Admin** | Admin needs to approve request of price edit.      | ❌ **To Do**       |

## 🔄 Daily Workflow

1.  **Start of Day**: Unlock the POS system. Check staff attendance.
2.  **Inventory Check**: quickly mark "Fresh Lobster" as _Out of Stock_ because the delivery didn't arrive.
3.  **Operations**: Monitor the live dashboard for high wait times in the kitchen; reassign a prep cook to the main line.
4.  **Issue Resolution**: A customer complains about a wrong order; the Manager approves a discount in the system.
5.  **End of Day**: Generate the "Z-Report" (daily closing), verify cash drawer, and lock any sensitive inventory.
