# Классно — контракт модулей

## Владение
T02 меняет только `server/schedule.mjs`, `src/features/schedule/*`, `tests/schedule.test.mjs`.
T03 меняет только `server/homework.mjs`, `src/features/homework/*`, `tests/homework.test.mjs`.
Каждый feature может импортировать свой CSS из entry page. Общие core файлы не менять; сообщать владельцу необходимые расширения.

## Сервер
`import {createApp,HttpError} from './server/core/app.mjs'`.
`createApp({dbPath='data/klassno.sqlite',origins?:string[],production?:boolean}) => {app,db,ctx,close()}`.
Тесты используют `request.agent(app)` и заголовок Origin `http://localhost:5173` на всех POST/PUT/DELETE. Возврат ошибок `{error:string}`.
`registerScheduleRoutes(app,ctx)` / `registerHomeworkRoutes(app,ctx)` вызываются до финальных 404/error handlers.
**Каждый маршрут feature сам включает `ctx.requireUser` middleware**, включая `/api/homework/:id`; не полагаться на общую авторизацию по префиксу.
`ctx`:
- `db`: node:sqlite DatabaseSync, `.prepare(sql).get/all/run(...params)`, `.exec(sql)`.
- `requireUser(req,res,next)` — middleware; ставит `req.user: User`, иначе 401.
- `requireTeacher(user,classId):void` — прямой guard, кидает 403 при чужом классе/не teacher.
- `accessibleStudentIds(user,classId):string[]` — также guard membership. teacher получает всех учащихся собственного класса (может быть []), student себя, parent только своих детей; чужой класс всегда 403.
- `HttpError(status,message)` — Error class.
- `text(value,label,max=200,required=true):string` — trim + required/type/length validation; optional отсутствующее поле передавать `value ?? ''`.
- `password(value):string` — length 10..128.
- `date(value,label='Дата',required=true):string` — ISO YYYY-MM-DD, calendar valid.
- `id():string` — UUID.
Параметры SQL всегда bind. Транзакции synchronous: BEGIN / COMMIT / catch ROLLBACK.

## Schema v1 (ВСЕ столбцы)
Все ID TEXT UUID кроме token_hash SHA256 hex; даты/время TEXT. Foreign keys ON. SQLite snake_case → DTO camelCase.
- users: id PK, role CHECK teacher|parent|student, login UNIQUE COLLATE NOCASE, name, password_hash, created_at.
- sessions: token_hash PK, user_id FK users CASCADE, expires_at.
- classes: id PK, teacher_id FK users, name, school_year, created_at.
- students: id PK, class_id FK classes CASCADE, user_id UNIQUE FK users, full_name, birth_date default '', parent_name default '', parent_phone default '', parent_email default '', private_note default ''.
- parent_links: parent_id FK users, student_id FK students CASCADE, PK(parent_id,student_id).
- invites: token_hash PK, student_id FK students CASCADE, expires_at, consumed_at nullable.
- password_resets: token_hash PK, user_id FK users, expires_at, consumed_at nullable.
- lessons: id PK, class_id FK classes CASCADE, day_of_week INTEGER 1..7 (1=Monday), lesson_number INTEGER 1..20, subject, room default ''; UNIQUE(class_id,day_of_week,lesson_number).
- bells: id PK, class_id FK classes CASCADE, lesson_number INTEGER 1..20, start_time HH:mm, end_time HH:mm; UNIQUE(class_id,lesson_number).
- homework: id PK, class_id FK classes CASCADE, subject, title, description default '', due_date YYYY-MM-DD, created_at, updated_at.
- completions: homework_id FK homework CASCADE, student_id FK students CASCADE, completed_at; PK(homework_id,student_id). Existence represents current completion.
- awards: id PK, class_id FK classes CASCADE, student_id FK students CASCADE, homework_id nullable FK homework SET NULL, kind CHECK automatic|manual, badge_key nullable, title, message default '', awarded_by nullable FK users, created_at.
- partial unique indexes: awards(student_id,badge_key) WHERE kind='automatic'; awards(student_id,homework_id) WHERE kind='manual'. Auto badge_key use stable 'completed_1', 'completed_5', 'completed_10'. Awards persist when completion removed. Manual requires completed homework.
- lookup indexes: students(class_id), homework(class_id,due_date), awards(student_id), sessions(user_id).
All columns NOT NULL except explicitly nullable above. No feature migrations needed.

## Core HTTP
- POST /api/auth/register {name,email,password,role:teacher|parent} → 201 {user,token?}.
- POST /api/auth/login {login,password} → {user,token?}.
- GET /api/auth/me → {user}; POST /api/auth/logout → 204.
- POST /api/auth/password {currentPassword,newPassword} → 204, all sessions reset.
- POST /api/auth/reset {token,password} → 204, one-use reset, all sessions reset.
- GET /api/classes → Classroom[]. POST /api/classes {name,schoolYear} → 201 Classroom.
- GET /api/classes/:id/students → Student[] (role-filtered).
- POST /api/classes/:id/students {fullName,login,password,birthDate?,parentName?,parentPhone?,parentEmail?,privateNote?} → 201 Student.
- PUT /api/classes/:id/students/:studentId {fullName,birthDate?,parentName?,parentPhone?,parentEmail?,privateNote?} → Student; full replacement of editable profile fields, login immutable.
- POST /api/students/:id/invites {} → 201 {token,expiresAt}; link /#invite=TOKEN, 48h one-use.
- POST /api/invites/accept {token} → {studentId}; parent only.
- User = {id,name,role:'teacher'|'parent'|'student',login}.
- Classroom = {id,name,schoolYear,teacherId}.
- Student = {id,classId,userId,fullName,login,birthDate,parentName,parentPhone,parentEmail,privateNote?}; privateNote teacher only.

## Feature HTTP conventions
Schedule:
- `GET /api/classes/:id/lessons` → `Lesson[]`, упорядоченные по `dayOfWeek`, затем `lessonNumber`.
- `POST /api/classes/:id/lessons {dayOfWeek,subject,room?}` → 201 `Lesson`: добавление в конец выбранного дня, номер назначает сервер.
- `PUT /api/classes/:id/lessons/:itemId {dayOfWeek,subject,room?}` → `Lesson`: в том же дне сохраняет позицию; при смене дня добавляет в конец нового дня и уплотняет старый.
- `DELETE /api/classes/:id/lessons/:itemId` → 204: удаление уплотняет оставшийся порядок дня.
- `PUT /api/classes/:id/lessons/order {dayOfWeek,lessonIds:string[]}` → `Lesson[]` всего класса в актуальном порядке. `lessonIds` — полный набор ID уроков указанного дня в желаемой последовательности, без повторов; пустой массив допустим только для пустого дня. Недопустимый формат/дубли → 400; неполный набор, лишние/чужие ID или изменившийся состав дня → 409 без частичного сохранения. Менять порядок может только учитель этого класса; ученики и родители читают.
- `Lesson = {id,classId,dayOfWeek,lessonNumber,subject,room}`. `dayOfWeek` — 1..7, понедельник=1; `lessonNumber` в ответе — позиция 1..N. До 20 уроков в дне, превышение при добавлении/переносе → 409. В POST/PUT поле `lessonNumber` больше не управляет позицией: если старый клиент его передаёт, допустимость целого 1..20 проверяется, затем значение игнорируется.
- Изменения порядка атомарны, ID уроков сохраняются. Схема БД не меняется, миграция не нужна: при записи затронутого дня позиции приводятся к непрерывным 1..N; сама загрузка существующего расписания его не перенумеровывает.
- Звонки сохраняют ручной `lessonNumber`: GET/POST `/api/classes/:id/bells`, PUT/DELETE `/api/classes/:id/bells/:itemId`; GET → массив, POST → 201 DTO, PUT → DTO, DELETE → 204. `Bell = {id,classId,lessonNumber,startTime,endTime}`. Время связано с позицией урока через `lessonNumber`, поэтому после перестановки предмет получает время нового слота; сами звонки не переставляются.
Homework: GET/POST /api/classes/:id/homework, GET/PUT/DELETE /api/homework/:id, PUT /api/homework/:id/completion, POST /api/homework/:id/awards, GET /api/classes/:id/awards. Child filtering via optional `?studentId=` query; guard that selected student is in accessibleStudentIds. Teacher can inspect whole class. Feature defines final response enrichment and documents it.

## Homework date suggestion
`src/features/homework/scheduleDate.mjs`: `normalizeSubject(subject:string):string`, `nextLessonDueDate(subject:string, lessons:{subject:string,dayOfWeek:number}[], today?:Date):string`. Возвращает локальную YYYY-MM-DD ближайшего точного совпадения предмета в диапазоне завтра..+7 дней либо пустую строку; trim/case/повторные пробелы нормализуются. Звонки не участвуют.
`HomeworkEditor` при каждом открытии запрашивает GET `/api/classes/:id/lessons` отдельно от списка заданий; abort/active guard игнорирует ответ закрытой формы/прошлого класса. Datalist показывает предметы расписания. Новое задание использует автоматическую дату до первого ручного изменения (включая очистку). Существующее задание всегда начинает с сохранённой даты; смена предмета её не меняет. Ошибка загрузки расписания показывает подсказку и оставляет ручной ввод доступным. API/схема ДЗ не меняются, dueDate по-прежнему обязательно передаётся в POST/PUT.

## Frontend shared contracts
`src/core/api.ts`: `api<T=void>(path:string,options?:RequestInit):Promise<T>`, errors throw ApiError with Russian `.message` and numeric `.status`; 401 emits klassno:unauthorized and clears the current session. Network logout failures are surfaced; expired-session 401 logout clears local state. Body JSON.stringify caller's object. `setBearer(string|null)` internal transport in memory, `isMobile()` uses Capacitor runtime.
`src/core/session.tsx`: `useSession() => {user:User|null,loading:boolean,authenticate(path,data):Promise<void>,logout():Promise<void>,clear():void}`; authenticated feature assumes user nonnull.
`src/core/classroom.tsx`: exports Classroom,Student types; `useClassroom() => {classes:Classroom[],classroom:Classroom|null,classId:string,setClassId(id),students:Student[],student:Student|null,studentId:string,setStudentId(id),loading:boolean,error:string,refresh():Promise<void>}`. students already access-filtered. Class switching clears students/studentId synchronously; generation guards ignore stale responses after later selection/refresh/unmount. Parent multi-child selector is in shell; student/studentId selected. Teacher may use students for completion/award selection. Features render only with classroom selected.
`src/core/ui.tsx`: Button(native button props + variant?:primary|secondary|ghost|danger), Input(native input props + label:string,error?:string), Dialog({title,onClose,children}), EmptyState({title,description?,action?:ReactNode,icon?:ReactNode}), ErrorMessage({message:string}). Dialog uses native modal/focus trap and escape close.
Feature default export `SchedulePage()` / `HomeworkPage()` / `AwardsPage()` no props, read contexts. Shell routes via local nav state.
Reusable CSS: page-heading, eyebrow, muted, pill, section-heading, form-actions, form-grid, field, error-message, student-grid, icon-button, empty-state. Features may define prefixed CSS in own files; do not edit core/styles.css concurrently.

## Runtime
`npm run dev`: Vite 5173 + Express 3000. Open http://localhost:5173. `npm run build`; `npm start` serves dist and API. `npm test` or `node --test tests/auth.test.mjs`.
Dev origins localhost:5173, localhost:3000, capacitor://localhost,http://localhost. Production ALLOWED_ORIGINS comma-separated exact origins required; absent means all mutations fail closed. Mobile token only for configured capacitor://localhost or http://localhost origin + X-Client:mobile, no cookie; web ignores X-Client:mobile at web origin. Bearer never localStorage. VITE_API_URL required for native deployed API base; VITE_WEB_URL required for shareable native teacher invitation links (public web origin). Production cookie Secure,HttpOnly,SameSite=Lax.
Operator: `DB_PATH=/persistent/klassno.sqlite PUBLIC_URL=https://school.example npm run reset-password -- LOGIN`. Verify owner's identity out-of-band, command prints a secret one-use link locally; transfer privately, never paste in logs/chat. Valid one hour; no SMTP imitation.
