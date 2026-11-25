# Student Grade Calculator

A responsive grade calculator with a browser "database" (localStorage) and a Java console version.

## Features
- Responsive layout (desktop and mobile), clean CSS with CSS variables
- Enter 5 subject marks, get total, percentage, grade, grade points, pass/fail
- Records saved in the browser database: search, delete, class average, topper
- `java/GradeCalculator.java`: console version that saves results to `students.csv`

## Run
- Web: open `index.html`, or visit the GitHub Pages link.
- Java: `cd java && javac GradeCalculator.java && java GradeCalculator`

## Grading scale
O 90+, A+ 80+, A 70+, B+ 60+, B 50+, C below 50. A mark below 40 in any subject gives F (Fail).
