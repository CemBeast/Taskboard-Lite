# AI Agent Project Prompts & Solutions

Below are the feature requests you asked for (prompts), and a summary of how each was addressed in your project.

---

## 1. Add an AI agent to read input and sort by due date
**Prompt:**
> How would I add an ai agent to my project? I want it to simply read the New task... input and add the task to the to do list in order of priority (based on what day they want to complete) and it should display the priorityRank for each task...

**Solution:**
- Built a rule-based "AI agent" to extract due dates from user prompts (using regex/NLP rules).
- Calculates task priority based on due date.
- Displays due date, priority, and days left.
- Tasks always appear in the correct order: Highest priority and soonest due date at the top.

---

## 2. Display both priority and days until due date
**Prompt:**
> I want both, one saying the days due and one for the task priority, if no date is provided in the input then show nothing.

**Solution:**
- Both "Priority" (High/Medium/Low) and "Days left" badges are shown for tasks with due dates.
- If no date is entered, only the priority is shown.

---

## 3. Show only the clean task title, not the full prompt
**Prompt:**
> I want it so the task displayed is not the full prompt entered, it should just be the task...

**Solution:**
- Stripped due-date phrasing from the displayed label.
- The UI shows only the task itself (e.g. "Finish Book Report" not "Finish Book Report by Nov 12").

---

## 4. Migrate old tasks to new cleaned-up display
**Prompt:**
> It is not showing on my front end, if i say 'do homework by nov 3' it puts that as the task rather than 'Do Homework'.

**Solution:**
- On app load, old tasks are cleaned up so their labels are also updated to the new format.

---

## 5. Enhanced date parsing ("in 3 days/weeks/months/years")
**Prompt:**
> I want it to handle prompts such as 'do homework in 3 days' or in 3 weeks or 4 months...

**Solution:**
- Date parser matches "in N days/weeks/months/years" and computes absolute due date.

---

## 6. Visual improvements and structured badge layout
**Prompt:**
> I want this project to be more visually appealing for the front end, each task should have a structured priority rank, due date, and days left within the view...

**Solution:**
- Modernized badge layouts, color coding, better card spacing, and clear separation of task meta-data.
- "Done" tasks show completion date and other meta-data.

---

## 7. Improved undo action for done tasks
**Prompt:**
> Now make it so that when I undo a task in the done section, it moves back to the in progress section instead of to do.

**Solution:**
- Undoing a done task puts it in "In Progress" (never returns to To-Do).

---

## 8. Expanded weekday parsing (by tuesday, by next Friday)
**Prompt:**
> Make sure that the NLP can take in prompts like 'finish task by tuesday' or 'finish task by next tuesday' by tracking today’s date...

**Solution:**
- Recognizes weekday-based due dates and parses intelligently based on the current date.

---

## 9. Remove display of priority rank, ensure full prompt is never displayed
**Prompt:**
> actually remove rank for the tasks display, no need to show that when we have priorityRank. Along with this make sure that it parses out the date when adding task 'finish task by tuesday' should only show finish task.

**Solution:**
- Removed "Rank" badge. Final task card labels display only the clean action label, with all date phrasing and rank numbers hidden.

---

## 10. Reminders section for upcoming tasks
**Prompt:**
> in my simpleWebDev i want to add reminders for to do tasks. Lets have a visual that shows the 5 soonest tasks and the main screen

**Solution:**
- Added a "Reminders: Upcoming Tasks" section at the top of the main screen.
- Automatically displays the 5 soonest tasks (by due date) that are not completed.
- Shows task name, due date, and days remaining for each reminder.
- Updates in real-time as tasks are added, modified, or completed.

---

## 11. Dashboard with numerical statistics
**Prompt:**
> now lets add a dash board that shows a lot of numerical values. one should be how many tasks are in which section, one should show avg completion rate of tasks (should be in days) and anything else you can think of that is relevant. it should be at the top of the html

**Solution:**
- Created a comprehensive dashboard at the very top of the page showing:
  - Task counts per section (To-Do, In Progress, Done)
  - Total tasks
  - Percentage complete
  - Average completion time (in days) for finished tasks
  - Number of overdue tasks
  - Soonest upcoming task with due date
- All stats update automatically as tasks change.
- Styled with neon/futuristic theme matching the app design.

---

## 12. Replace emoji buttons with themed SVG icons
**Prompt:**
> how can we change the buttons for the kanban board away from emojis? i dont like emojis, what can we use instead?

**Solution:**
- Replaced all emoji action buttons with custom themed SVG icons:
  - Edit (pencil icon)
  - Move to To-Do (arrow-up icon)
  - Move to In Progress (clock/progress icon)
  - Mark as Done (checkmark icon)
  - Delete (trashcan icon)
- All icons use the app's neon color palette and have glowing hover effects.
- Fully accessible and keyboard-friendly.

---

## 13. Priority threshold configuration system
**Prompt:**
> can we add an edit system at the bottom to configure the low, medium, high priority? the user can edit the days required for low, med high, but low must be < med, and med < high

**Solution (Multiple iterations):**
- **Initial request:** Added editable priority thresholds at the bottom of the page.
- **Refinement 1:** Changed to always-visible inline editing - click any threshold value to edit it directly.
- **Refinement 2:** Relabeled for clarity - "High Priority: ≤ X days • Medium Priority: ≤ Y days • Low Priority: ≤ Z days"
- **Final implementation:**
  - All three thresholds (High, Medium, Low) are editable inline.
  - Default values: High = 3 days, Medium = 7 days, Low = 14 days.
  - Validation ensures: 0 < High < Medium < Low.
  - Priority logic:
    - Tasks due in ≤ High days → High priority
    - Tasks due in > High and ≤ Medium days → Medium priority
    - Tasks due in > Medium and ≤ Low days → Low priority
    - Tasks due in > Low days → Low priority
  - Settings persist in localStorage.
  - Visual feedback on invalid inputs.

---
## 14. Futuristic UI redesign for dashboard and Kanban board  
**Prompt:**  
> I want the dashboard to look more aesthetically pleasing, can you make it more futuristic like? (NO EMOJIS)  

**Solution (by ChatGPT):**  
- Completely redesigned the **CSS** theme for a modern, futuristic aesthetic:  
  - Dark glassmorphism background with subtle neon gradients and glow effects.  
  - Rounded card panels for all dashboard, reminders, and task columns.  
  - Distinct color accents for priority levels (green, yellow, red) with smooth shadows.  
  - Clean typography and grid spacing for a sleek, minimalistic feel.  
- Replaced the old emoji-based buttons with **SVG icons** for Edit, Move, Done, and Delete—keeping the interface professional and emoji-free.  
- Integrated an animated background gradient for depth while maintaining readability.  
- Applied consistent layout across all sections: Dashboard → Reminders → Kanban Board.  
- No functional logic was changed—only the UI presentation improved.  
- CSS is fully modular; can be dropped directly into `styles.css` by replacing the old version.  

---

## 15. File update instructions and deployment integration  
**Prompt:**  
> can you tell me where i put the css code in? what do i delete? show me where to update the code for css and html  

**Solution (by ChatGPT):**  
- Provided **step-by-step instructions** for integrating the new futuristic design:  
  - Replace all contents of `styles.css` with the new theme (or back up the old file as `styles.old.css`).  
  - Update `<head>` in `index.html` with the correct `<link>` to `styles.css`, updated title (`TaskBoard Lite — Neon`), and theme color meta tag.  
  - No other HTML or JS structural changes required—the CSS automatically applies to all existing elements.  
- Clarified that the design contains **no emojis**, ensuring a professional and consistent look.  
- Verified compatibility with **GitHub Pages**, including instructions for forcing cache refresh and confirming redeployment updates after pushing to the `main` branch.  

---

### Visual Theme Summary
*(Documented by ChatGPT)*  
- **Primary Background:** `#0b1020` to `#0e203d` radial gradient.  
- **Accent Colors:**  
  - Brand Blue: `#6ea3ff`  
  - Secondary Purple: `#9a6bff`  
  - Neon Cyan: `#39e1ff`  
- **Priority Badge Colors:**  
  - High: Red glow `#ff5c7a`  
  - Medium: Yellow glow `#ffdf6a`  
  - Low: Teal glow `#38f8b6`  
- **UI Style:** Glassmorphic panels, soft borders, and neon glow hover states.  
- **Typography:** System UI stack with smooth weight transitions and letter spacing for readability.  
- **Layout:** Grid-based responsive dashboard with consistent spacing and balanced hierarchy.  


**Sample Prompts your app now handles:**
- Finish book report by November 12
- Do laundry in 3 days
- Pay bills in 5 weeks
- Start diet next Monday
- Schedule dentist by Friday
- File taxes (no date)
- Call friend by tomorrow
- Finish task by next Tuesday

Your project shows only the core task text with relevant badges for priority, due date, days left, or completed date, as appropriate.

---

## Session: November 13, 2024 - Advanced AI Integration & Debugging
**AI Assistant Used:** Claude Sonnet 4.5 (via Cursor)

### 16. Running HTML project locally and fixing AI API connectivity
**Prompt:**
> how do i run my project in html AND have the AI agent API work? currently when i open the index htm file it says "This page says: Failed to process task, please try again" but i cannot do anything about it to get it to work.

**Solution:**
- **Problem identified:** Opening `index.html` directly as a file (`file://`) causes CORS errors that block API requests.
- **Solution:** Set up a local HTTP server using Python:
  ```bash
  python3 -m http.server 8080
  ```
- Accessed the app via `http://localhost:8080` instead of file protocol.
- Fixed Gemini API endpoint from experimental `gemini-2.0-flash-lite` to stable `gemini-pro` model.
- Added comprehensive model checking utility (`check-models.html`) to verify available Gemini models.
- Discovered `gemini-2.5-flash-lite` was the best option for highest rate limits (60 requests/minute vs 15).

---

### 17. API rate limiting and error handling improvements
**Prompt:**
> i believe the limit is 5 every minute? or what is it

**Solution:**
- Implemented client-side rate limiting to prevent hitting Gemini API limits:
  - Tracks request count and timing
  - Shows clear error messages when rate limit exceeded
  - Gemini free tier limits: 15-60 requests/minute depending on model
- Added better error handling with specific messages:
  - 429 (Rate Limit): "Wait 60 seconds and try again"
  - 403 (Forbidden): "Enable Generative Language API in Google Cloud Console"
  - 400 (Bad Request): "Check API key and model name"
- Updated to use `gemini-2.5-flash-lite` for best performance and highest limits.

---

### 18. Enhanced AI prompt for comprehensive date/time parsing
**Prompt:**
> I want it to handle "BY" november 19th or "due" november 19th or "finish X by next tuesday"

**Solution:**
- Significantly enhanced AI prompt with extensive examples covering:
  - Month names: "November 19th", "Nov 19", "november 19"
  - Date formats: "11/19", "11-19", "11.19"
  - Keywords: "by", "due", "finish", "complete", "before"
  - Weekdays: "next Monday", "Friday", "next Tuesday"
  - Relative dates: "tomorrow", "in 3 days", "next week"
- AI now provides current date context in prompt for accurate relative date calculation.
- Added real-world examples with actual computed dates to guide AI responses.
- Improved JSON extraction from AI responses (handles markdown wrapping).

---

### 19. Visual improvements: Better trash icon
**Prompt:**
> can we change the UI for the trash visual to actually be a trash can?

**Solution:**
- Replaced generic delete icon with a clear, recognizable trash can SVG icon:
  - Classic trash can silhouette with lid and body
  - Vertical lines inside for depth
  - Consistent with app's neon theme
  - Red danger color on hover

---

### 20. Editable task creation dates for UX testing
**Prompt:**
> can you make it so that it says the date assigned for each task and it is editable too? so i can do some user experience testing with the dashboard and computing avg days

**Solution:**
- Added visible "Assigned" date badge to all tasks showing `createdDate`.
- Made assignment date fully editable in task edit form.
- Updated average completion calculation to use `createdDate` instead of `id` timestamp:
  - Now accurately calculates days between assignment and completion
  - Supports retroactive date editing for testing scenarios
- Displays: `Assigned: 2024-11-09` badge alongside due date and priority.

---

### 21. Enhanced task editing UI/UX
**Prompt:**
> make the editing more visually appealing, it should show the title for each thing that is being edited, and the task should be editable as well

**Solution:**
- Redesigned edit form with vertical layout and clear labels:
  - **Task** (text input - now editable)
  - **Priority** (dropdown)
  - **Due Date** (date picker)
  - **Assigned** (date picker)
- Added proper label styling with color `#bccaff` and font weight `700`.
- Save/Cancel buttons positioned below inputs.
- All fields now editable including task name itself.

---

### 22. Calendar icon visibility fix
**Prompt:**
> i just want the calendar icon next to the written date (11/13/25) to be white because its hard to see as the background is dark

**Solution:**
- Applied CSS filter to date picker calendar icon:
  ```css
  .edit-form input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1) brightness(2.2);
  }
  ```
- Calendar icon now bright white, highly visible on dark background.

---

### 23. Time support implementation (later reverted)
**Prompt:**
> now i want to add in specific times for due dates, it can be optional but if the input is "Finish task by 8pm Friday" then it should handle the time assigned and time for the duedate

**Solution (implemented then rolled back):**
- Initially added comprehensive time support:
  - Time pickers (`type="time"`) in edit forms
  - AI parsing for time expressions ("8pm", "10:30am", "23:19", "midnight")
  - Storage of `dueTime` and `createdTime` fields
  - Display of times in badges and debug mode
- Enhanced AI prompt to extract times in 24-hour HH:mm format.
- **User requested removal of all time features** - reverted to date-only system.

---

### 24. Debug mode for time tracking
**Prompt:**
> i want the tasks to also show the time created and time due, i want it to be a debug option so for now debug will be on

**Solution:**
- Added `DEBUG_MODE = true` constant.
- When enabled, shows debug info under each task:
  - Original implementation: "Debug: Assigned: 2024-11-13, 10:30 | Due: 2024-11-15, 20:00"
  - After time removal: "Debug: Assigned: 2024-11-13 | Due: 2024-11-15"
- Uses subtle gray color (`#8895bf`) and small font (12px).
- Easy to toggle on/off by changing DEBUG_MODE constant.

---

### 25. Text capitalization fixes
**Prompt:**
> the tasks are still all caps, change it only first word of each sentence is capitalized

**Solution:**
- Fixed `extractCleanTaskText()` function to use:
  ```javascript
  clean.charAt(0).toUpperCase() + clean.slice(1);
  ```
- Applied same logic to AI-parsed text:
  ```javascript
  cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase();
  ```
- Result: "Finish homework by tomorrow" → "Finish homework" (not "FINISH HOMEWORK")

---

### 26. Testing utilities for AI agent
**Prompt:**
> edit the ai-test.html to see if the time is being set

**Solution:**
- Created comprehensive `ai-test.html` testing page:
  - Shows all AI parsing results (cleanText, dueDate, dueTime, priority)
  - Test buttons for common scenarios
  - Displays raw AI responses in console
  - Real-time testing without affecting main app data
- Added test cases for time-based inputs
- Shows `--` for missing fields to make parsing results crystal clear

---

### Key Technical Improvements Made This Session:

1. **Local Development Setup**: Python HTTP server for proper CORS handling
2. **API Management**: Rate limiting, error handling, model optimization
3. **AI Model Selection**: Upgraded to `gemini-2.5-flash-lite` for best performance
4. **Enhanced Prompting**: Comprehensive date/time parsing with real examples
5. **UI/UX Polish**: Better icons, editable fields, clear labels, visible controls
6. **Debug Tooling**: Debug mode, test pages, detailed console logging
7. **Date Handling**: Editable assignment dates, accurate completion time calculation
8. **Text Formatting**: Proper capitalization (only first letter)

### Files Modified:
- `app.js` - Core logic, UI rendering, task management
- `aiAgent.js` - AI prompt engineering, API calls, error handling
- `styles.css` - Calendar icon visibility
- `ai-test.html` - Testing utility for AI parsing
- `check-models.html` - Model availability checker (new file)

### Testing Recommendations:
1. Always use `http://localhost:8080` (never open HTML files directly)
2. Use `ai-test.html` to verify AI parsing before adding to Kanban board
3. Check `check-models.html` if API calls fail
4. Monitor browser console for detailed AI response logging
5. Test date formats: "by November 19", "11/19", "next Tuesday", "in 3 days"
