export const normalizeSubject = subject => subject.trim().replace(/\s+/g, ' ').toLowerCase();

// A weekly schedule has no occurrence date: today is deliberately excluded.
// Use the teacher's local calendar, not UTC formatting or 24-hour arithmetic.
export function nextLessonDueDate(subject, lessons, today = new Date()) {
 const target = normalizeSubject(subject);
 if (!target || Number.isNaN(today.getTime())) return '';
 let nearest = 8;
 for (const lesson of lessons) {
  if (normalizeSubject(lesson.subject) !== target || !Number.isInteger(lesson.dayOfWeek) || lesson.dayOfWeek < 1 || lesson.dayOfWeek > 7) continue;
  const distance = (lesson.dayOfWeek % 7 - today.getDay() + 7) % 7 || 7;
  nearest = Math.min(nearest, distance);
 }
 if (nearest === 8) return '';
 const due = new Date(today);
 due.setHours(12, 0, 0, 0);
 due.setDate(due.getDate() + nearest);
 return `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
}
