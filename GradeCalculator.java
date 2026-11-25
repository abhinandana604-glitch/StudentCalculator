import java.io.*;
import java.util.*;

/** Console version of the Student Grade Calculator. Saves each result to students.csv */
public class GradeCalculator {
    static final String[] SUBJECTS = {"Mathematics", "Physics", "Chemistry", "English", "Computer Science"};
    static final int PASS_MARK = 40;

    static String gradeFor(double pct) {
        if (pct >= 90) return "O";
        if (pct >= 80) return "A+";
        if (pct >= 70) return "A";
        if (pct >= 60) return "B+";
        if (pct >= 50) return "B";
        return "C";
    }

    public static void main(String[] args) throws IOException {
        Scanner sc = new Scanner(System.in);
        System.out.print("Student name: ");
        String name = sc.nextLine().trim();
        System.out.print("Roll number: ");
        String roll = sc.nextLine().trim();

        int total = 0;
        boolean failed = false;
        for (String s : SUBJECTS) {
            int m;
            do {
                System.out.print(s + " (0-100): ");
                while (!sc.hasNextInt()) { sc.next(); System.out.print(s + " (0-100): "); }
                m = sc.nextInt();
            } while (m < 0 || m > 100);
            total += m;
            if (m < PASS_MARK) failed = true;
        }

        double pct = total / (double) SUBJECTS.length;
        String grade = failed ? "F" : gradeFor(pct);
        String status = failed ? "Fail" : "Pass";

        System.out.printf("%nTotal: %d/%d%nPercentage: %.2f%%%nGrade: %s%nStatus: %s%n",
                total, SUBJECTS.length * 100, pct, grade, status);

        try (FileWriter fw = new FileWriter("students.csv", true)) {
            fw.write(roll + "," + name + "," + total + "," + String.format("%.2f", pct) + "," + grade + "," + status + "\n");
        }
        System.out.println("Saved to students.csv");
    }
}
