# Общие контракты

## Границы, решённые в спецификации
| Модуль | Владеет | Выставляет | Прячет |
|---|---|---|---|
| server/core | SQLite schema/migrations, users, sessions, classes, students, parent links | createApp({dbPath}), db, requireUser, requireTeacher(classId), accessibleStudentIds(user,classId), HttpError, request validation; REST /api/auth/*, /api/classes, /api/classes/:id/students, /api/invites/* | Хеши, SQL, приватные анкеты |
| server/schedule | Уроки и звонки | registerScheduleRoutes(app, ctx); GET/POST /api/classes/:id/lessons и /bells, PUT/DELETE соответствующих /:itemId | Проверку пересечений и SQL |
| server/homework | Задания, completion, awards | registerHomeworkRoutes(app, ctx); /api/classes/:id/homework, /api/homework/:id, /api/homework/:id/completion, /api/homework/:id/awards, /api/classes/:id/awards | Правила наград и транзакции |
| src/core | API client, auth context, class/student selection, shared controls, app shell | api<T>(path,options), useSession(), useClassroom(), Button/Input/Dialog/EmptyState; данные контекста документируются исполнителем T01 | Cookie/bearer транспорт |
| src/features/schedule | UI расписания | default SchedulePage, props/context из core | Состояния форм |
| src/features/homework | UI ДЗ и наград | default HomeworkPage, default AwardsPage, props/context из core | Формы и представления |
| mobile delivery | Capacitor configuration, native projects, packaging | npm run mobile:sync, инструкции iOS/Android | Подпись магазина не включается |

Главный шов тестов — HTTP API настоящего приложения с временной SQLite базой через node:test + supertest. Проверять полные сценарии и запрещённый доступ: две независимые семьи/класса, вход/выход, принятие приглашения, анкеты, ДЗ, повторные награды. UI проверяется сборкой TypeScript/Vite и браузером на desktop/mobile. Не мокать собственную бизнес-логику.


## Общие правила
React/TypeScript/Vite/Capacitor8, Node Express + node:sqlite. T01 создаёт package.json, tsconfig, схему ВСЕХ таблиц и заглушки подключаемых модулей. T02/T03 затем меняют только свои зоны. Точные поля схемы и контексты T01 возвращает оркестратору до запуска T02/T03.
Команды целевые: npm run dev, npm run build, npm test (node --test tests/*.test.mjs), один файл: node --test tests/NAME.test.mjs. T01 вправе подобрать минимальные необходимые зависимости и установить их; остальные исполнители сообщают недостающие зависимости. Никаких секретов/демо аккаунтов в production. Не коммитить: оркестратор коммитит после независимой проверки. .autopilot не редактировать.

## Факты окружения для T04
- Android Studio установлен; JDK: `/Applications/Android Studio.app/Contents/jbr/Contents/Home`.
- Android SDK: `$HOME/Library/Android/sdk`, platforms android-34/35/36, build-tools 34/35/36/36.1.
- `xcodebuild -version` заявляет Xcode 26.6; `xcrun simctl list devices available` падает: отсутствует CoreSimulator binary. Проверить реальную доступность сборки, не считать iOS проверенным по версии.
- Локальный dashboard server на 8766 успешно запущен через sandbox escalation. Для app/test listener при EPERM использовать штатную эскалацию. Все серверы на loopback до явного развёртывания.
- Уточнение native среды: bundled JDK реально запускается (OpenJDK21.0.10). `xcodebuild -showsdks` перечисляет iphoneos26.5 и iphonesimulator26.5: попытка generic simulator build без запуска может пройти, даже при сломанном simctl runtime.

## Из таска 01 — подтверждённый контракт
Точные общие интерфейсы и схема: `core-contract.md` в корне, прочитать полностью. createApp({dbPath,origins,production})->{app,db,ctx,close}; ctx.requireUser middleware, ctx.requireTeacher(user,classId), ctx.accessibleStudentIds(user,classId), ctx.HttpError/text/date/id. User role глобальная, проверка teacher ownership/parent_links на классе. registerScheduleRoutes(app,ctx) / registerHomeworkRoutes(app,ctx) сами навешивают requireUser. Frontend api<T>(path,RequestInit); useSession; useClassroom; feature pages default export без props. Команды: npm run dev (localhost5173+API3000), npm run build, npm start, npm test; single node --test tests/auth.test.mjs.
