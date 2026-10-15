# ⚡ HabitPulse — Interactive Habit & Streak Tracker Dashboard

**HabitPulse** is a sleek, responsive, zero-dependency web application designed to help users log daily routines, visualize weekly completion rates, and build long-term consistency. Built with semantic HTML5, modern CSS3 (custom properties, Flexbox/Grid), and vanilla ES6+ JavaScript, it features live analytics, streak computation, category filtering, bulk habit management, and automatic `localStorage` persistence.

---

## ✨ Key Features

- **📅 Interactive 7-Day Habit Matrix**: Toggle daily completions (`Mon – Sun`) with smooth micro-interactions and instant visual feedback.
- **🔥 Real-Time Streak Engine**: Automatically calculates active streaks per habit and highlights top-performing routines with dynamic badges.
- **📊 Live Weekly Analytics**:
  - **SVG Progress Ring**: Displays overall weekly completion percentage and total check-in counts.
  - **Interactive 7-Day Bar Chart**: Visualizes daily goal completion rates. Click any day bar or table column header to inspect specific daily progress.
  - **Category Mastery Breakdown**: Tracks completion percentages across custom focus areas (*Coding*, *Academics*, *Creative*, *Mind & Growth*, *Fitness*).
- **🗑️ Individual & Bulk Habit Removal**:
  - Dedicated trash button on every habit row for single-click removal.
  - **Manage Mode** with row checkboxes and a "Select All" toggle for bulk deleting multiple habits at once.
  - **Instant Undo Toast**: Accidentally deleted a habit? Click **↩ Undo** on the popup notification to restore habits to their exact positions.
- **🎨 Custom Habit Builder Modal**: Create new habits with custom titles, category tags, icons, and 6 vibrant accent color swatches.
- **🌓 Dark & Light Theme Support**: Seamlessly switch between a high-contrast dark slate UI and a clean daylight theme.
- **💾 Automatic LocalStorage Persistence**: All habits, check-ins, and changes are saved automatically in the browser—no backend or account required.

---

## 📂 Project Structure

```text
habit-tracker-dashboard/
│
├── index.html      # Main application layout, KPI cards, table matrix, and modals
├── style.css       # Custom CSS variables, dark/light theming, responsive grid & animations
├── script.js       # State management, streak calculation, DOM rendering & LocalStorage logic
└── README.md       # Project documentation
```

---

## 🚀 Getting Started

Because this project is built with vanilla HTML, CSS, and JavaScript, no build tools or package managers (`npm`, `webpack`, etc.) are required.

### Option 1: Open Directly in Browser
1. Download or clone this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/habit-tracker-dashboard.git
   ```
2. Navigate into the project directory:
   ```bash
   cd habit-tracker-dashboard
   ```
3. Double-click `index.html` to open it in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run with VS Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension by Ritwick Dey (if not already installed).
3. Right-click `index.html` in the Explorer panel and select **"Open with Live Server"**.

---

## 🛠️ Usage Guide

1. **Logging Daily Goals**: Click any square check button under `Mon–Sun` to mark a habit as completed or incomplete for that day.
2. **Inspecting a Specific Day**: Click any day header (`Mon`, `Tue`, etc.) in the table or any bar in the **Weekly Streak Chart** to inspect that day's completion ratio in the top KPI card.
3. **Adding a New Habit**: Click the **+ New Habit** button in the top navigation bar, enter a title, choose a category, pick an icon and color swatch, and click **Add Habit**.
4. **Filtering by Category**: Use the category pills above the habit table (*All Habits*, *Coding*, *Academics*, etc.) to focus on specific areas.
5. **Removing Habits**:
   - **Single Delete**: Click the 🗑️ button on the far right of any habit row.
   - **Bulk Delete**: Click **⚙️ Manage Habits**, select the checkboxes next to the habits you want to remove, and click **🗑️ Delete Selected**.
   - **Undo**: Click **↩ Undo** on the toast notification at the bottom-right within 5.5 seconds to restore deleted habits.
6. **Resetting Starter Data**: Click **🔄 Reset Sample** in the header at any time to restore the default pre-populated habits and sample streaks.

---

## 💻 Tech Stack

- **Markup**: HTML5 (Semantic elements, accessible attributes, inline SVG progress ring)
- **Styling**: CSS3 (CSS Custom Properties / Variables, CSS Grid, Flexbox, keyframe/cubic-bezier transitions)
- **Logic**: Vanilla JavaScript (ES6+, `localStorage` API, DOM manipulation, structured cloning)
- **Typography**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

---

## 🔮 Future Enhancements

- [ ] Multi-week calendar history and monthly heatmap view (GitHub contribution style)
- [ ] Export/Import habit data as JSON or CSV backup files
- [ ] Daily reminder notifications using the Web Notifications API
- [ ] Drag-and-drop row reordering

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE). Feel free to fork, customize, and use it in your personal portfolio!

## Link
(https://nikhillshrma.github.io/HabitPulse/)
