# 🛡️ Role: Super Admin / Owner

## 👤 User Persona

**Who are they?**
The Business Owner or System Administrator. They do not cook food or serve tables. Their primary concern is the _health of the business_, configuration of outlets, and oversight of all operations.

## 🔐 Access Level

- **Routes**: `/admin/*`
- **Capabilities**: Full access to all system configurations. Can create/delete Outlets and Outlet Managers.
- **Restrictions**: Generally does not interfere with day-to-day granular operations (like mocking a specific order as "cooked") unless auditing.

## 🛠️ Key Features & Implementation Status

| Feature                    | Description                                                         | Status             |
| :------------------------- | :------------------------------------------------------------------ | :----------------- |
| **Authentication**         | Secure login, password reset, session management.                   | ✅ **Done**        |
| **Outlet Management**      | Create new restaurant branches (outlets), assign specific managers. | ✅ **Done**        |
| **Staff Oversight**        | View all staff across all outlets.                                  | ✅ **Done**        |
| **Global Menu**            | Define the "Master Menu" available to all outlets.                  | ✅ **Done**        |
| **Analytics Dashboard**    | Aggregated view of total sales, top performing outlets.             | ❌ **To Do**       |
| **Audit Logs**             | View system-wide critical actions (e.g., who deleted a menu item).  | ❌ **To Do**       |
| **Billing & Subscription** | Manage SaaS payments for the platform usage.                        | ❌ **To Do**       |
| **Users**                  | Add and remove Users, edit them, filter role and outlet wise        | ✅ **Done**        |

## 🔄 Daily Workflow

1.  **Morning Check**: Log in to view the "System Health" dashboard. Check if any outlet has reported issues.
2.  **Configuration**: Add a new seasonal "Summer Special" item to the Master Menu.
3.  **Expansion**: Create a new Outlet entity for the "Downtown" location and invite the new Manager.
4.  **End of Month**: download financial reports for all outlets to process payroll and taxes.
