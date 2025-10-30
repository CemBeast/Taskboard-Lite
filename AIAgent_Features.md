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
