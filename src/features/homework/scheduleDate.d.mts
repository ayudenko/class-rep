export type ScheduledLesson = {subject:string;dayOfWeek:number};
export function normalizeSubject(subject:string):string;
export function nextLessonDueDate(subject:string,lessons:readonly ScheduledLesson[],today?:Date):string;
