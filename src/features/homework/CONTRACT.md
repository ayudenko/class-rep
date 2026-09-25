# Homework feature API

Every route requires authenticated user and class membership. Nonteachers only see accessible students' completion/awards. Optional `?studentId=UUID` on reads restricts to that student and is rejected if inaccessible. Teachers may omit it for the full class.

- GET `/api/classes/:id/homework` → Homework[] sorted dueDate/id.
- POST same path `{subject,title,description?,dueDate}` → 201 Homework.
- GET/PUT/DELETE `/api/homework/:id` → Homework / Homework / 204. PUT body is full replacement of editable fields. Writes teacher only.
- PUT `/api/homework/:id/completion` `{completed:boolean}` → Homework. Student only, changes own record. Optional studentId must equal authenticated student's id. Repeat idempotent.
- POST `/api/homework/:id/awards` `{studentId,message}` → 201 Award; repeat 200 same Award. Teacher only, requires completion to create, existing award remains valid when completion removed. Nonblank message <=1000.
- GET `/api/classes/:id/awards` → `{studentId:string|null,completedCount:number,badges:Badge[],awards:Award[]}`. completedCount is number of currently completed distinct assignments for selected student. If multiple students selected implicitly, studentId=null and completedCount=0; UI always selects one.

Homework = `{id,classId,subject,title,description,dueDate,createdAt,updatedAt,completions:[{studentId,completedAt}],completed,completedCount,studentCount}`. completed means any accessible selected student completed; teacher UI treats all completed when completedCount===studentCount and studentCount>0. No other students' metadata is exposed to families.
Award = `{id,classId,studentId,homeworkId:string|null,kind:'automatic'|'manual',badgeKey:string|null,title,message,createdAt}`.
Badge = `{key,threshold,title,description}`; keys completed_1/completed_5/completed_10.

Automatic badge thresholds use simultaneous current completed count; earned awards persist forever when marks are removed or tasks deleted. Repeated toggles cannot create duplicate auto awards (student+badge key). Manual awards unique per student+homework. Completion+auto award and manual award checks/inserts use SQLite transactions and schema unique indexes.

UI defaults export HomeworkPage/AwardsPage, no props; context from core. Own CSS only. Per-class/child keyed workspaces prevent stale selection requests from changing another workspace. Teacher detail lists every student and permits praise for completed assignments. No rankings.

Mutation success and list refresh have separate UI outcomes: successful create/update closes the form immediately and upserts the returned Homework; successful delete closes confirmation and removes the item locally. A subsequent GET failure shows “Изменение сохранено” with a standalone GET-only “Обновить список” retry. Form input is retained only when mutation fails. Manual awards close their form on successful POST and have no dependent refresh; completion uses the returned Homework directly.
