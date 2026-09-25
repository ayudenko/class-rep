export type Homework={id:string;classId:string;subject:string;title:string;description:string;dueDate:string;completed:boolean;completedCount:number;studentCount:number;completions:{studentId:string;completedAt:string}[]};
export type Award={id:string;studentId:string;homeworkId:string|null;kind:'automatic'|'manual';badgeKey:string|null;title:string;message:string;createdAt:string};
export type Awards={studentId:string|null;completedCount:number;badges:{key:string;threshold:number;title:string;description:string}[];awards:Award[]};
export const formatDate=(date:string)=>new Date(`${date.slice(0,10)}T12:00:00`).toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
