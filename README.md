# 🏠 Room Maintenance & Daily Expense Tracker

A modern web application built for 3 roommates/friends to track daily purchases, view analytics with interactive bar charts, search expense history by date range ("From Date" to "To Date"), and automatically calculate 1/3 fair settlements.

## 👥 Three Friends
1. **Vikash Meena**
2. **Devendra Singh**
3. **Kamlesh Meena**

---

## 🚀 Key Features

1. **Kharcha (Expense) Entry Form**:
   - Fixed dropdown with **only** the 3 friends' names (*Vikash Meena, Devendra Singh, Kamlesh Meena*).
   - Item description with quick item chips (*Doodh, Sabji, Room Rent, Bijli Bill, Gas Cylinder, etc.*).
   - Price / Amount input in ₹.
   - **Automatic Date & Day of Week calculation** (e.g. `24 Nov 2026`, `Tuesday / मंगलवार`).
   - Category selector (*Sabji & Ration, Dairy, Room Rent & Bills, Gas & Cooking, etc.*).
   - Instant reactive update across Dashboard, History, and Charts.

2. **Dashboard & Bar Chart Analytics**:
   - Total Room Kharcha card with real-time summary.
   - Individual contribution cards with percentage share and progress bars.
   - **Interactive Bar Chart** comparing total payments of Vikash, Devendra, and Kamlesh.
   - Contribution share donut chart.
   - Day-of-the-week spending pattern chart.

3. **Date-wise History & Search Filter ("Is se us date tak")**:
   - Search between **"From Date"** and **"To Date"**.
   - Quick range presets: *Today, Yesterday, Last 7 Days, This Month, All Time*.
   - Filter by Friend or Item description text search.
   - **Dynamic Filtered Total**: Shows the exact sum of money spent in the selected date range and individual breakdown!
   - Export filtered/all expenses to CSV spreadsheet.
   - Delete expense option with instant update.

4. **Hisab-Kitab / Split Calculator (Settlement)**:
   - Equal 1/3rd share calculation (`Total / 3`).
   - Net balance for each friend (positive = to receive, negative = to pay).
   - Direct transfer instructions (*e.g., "Kamlesh Meena ➔ Devendra Singh: ₹46.66"*).
   - **1-Click Copy for WhatsApp Group** to share daily hisab with roommates!

---

## 🛠️ Tech Stack & Database

- **Database**: PostgreSQL (`maintenance_db`) on port 5432.
- **Backend**: Node.js + Express + TypeScript (`pg` pool, robust REST APIs).
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts.

---

## 🏃 Running the Application

### Option 1: Quick Launch (Production Single Port)
Simply double click `start-app.bat` or run:
```bash
npm start
```
Then open: **[http://localhost:5000](http://localhost:5000)**

### Option 2: Development Mode (with Hot Reload)
1. In one terminal:
   ```bash
   cd backend
   npm run dev
   ```
2. In another terminal:
   ```bash
   cd frontend
   npm run dev
   ```
Then open: **[http://localhost:3000](http://localhost:3000)**
