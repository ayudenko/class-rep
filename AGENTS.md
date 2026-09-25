<!-- autopilot:start -->
# Школьный класс / Классно
Русскоязычное приложение учителя, учеников и родителей. React 19 + TypeScript + Vite 7, Express 5 + встроенный `node:sqlite`, Capacitor 8. Node >=22.13. Сборка ведётся навыком autopilot; требования и состояние — в `.autopilot/`. Требования может снять только пользователь.

## Команды

- `npm ci` — зависимости; `npm run dev` — Vite и Node watch. Открывать `http://localhost:5173`: разрешённый Origin именно localhost; API слушает `127.0.0.1:3000`.
- `npm run build` — TypeScript + Vite в `dist/`; `npm start` — API и собранный веб из `dist/` на порту 3000.
- `npm test` — `node --test tests/*.test.mjs`; отдельный файл: `node --test tests/schedule.test.mjs` (также auth/homework).
- `npm run reset-password -- USER_LOGIN` — операторское восстановление; вывод содержит секретную одноразовую ссылку, не помещать её в общие логи/чат. Перед выдачей проверить владельца вне приложения; SMTP нет.

## Структура и интерфейсы

- `src/main.tsx` → `src/core/App.tsx`; общие UI и CSS — `src/core/ui.tsx`, `styles.css`; `useSession()` и `useClassroom()` — контексты аккаунта, класса и выбранного ребёнка.
- `src/core/api.ts`: `api<T>(path, RequestInit)`; вызывающий сериализует body. Ошибки `ApiError`, ответ API `{error:string}`, 401 сбрасывает сессию через `klassno:unauthorized`.
- `src/features/schedule/` — расписание и звонки; `src/features/homework/` — задания и награды, со своими CSS. Страницы читают общие контексты.
- `server/index.mjs` — listener и static; `server/core/app.mjs`: `createApp({dbPath,origins,production}) → {app,db,ctx,close}`; `classroom.mjs` — классы, анкеты, приглашения; `security.mjs` — хеши/валидация.
- `server/schedule.mjs` и `server/homework.mjs` подключаются через `registerScheduleRoutes(app,ctx)` / `registerHomeworkRoutes(app,ctx)` и сами навешивают `ctx.requireUser`. Контекст даёт `db`, `requireTeacher(user,classId)`, `accessibleStudentIds(user,classId)`, `HttpError`, валидаторы и `id()`.

## Данные и доступ

- Схема всех таблиц — `server/core/db.mjs`: SQLite WAL, foreign keys, `CREATE TABLE IF NOT EXISTS`, `user_version=1`. Отдельного migration runner нет: изменение существующей схемы требует явного пути обновления. По умолчанию БД `data/klassno.sqlite`.
- Пароли — salted scrypt; токены сессий/приглашений/сброса хранятся как SHA256. Веб: HttpOnly/SameSite=Lax cookie, Secure в production. Native: bearer только в памяти; после закрытия нужен вход. Смена/сброс пароля отзывает сессии.
- Teacher имеет доступ только к своим классам; student — к себе, parent — к детям через `parent_links`. Проверять принадлежность на сервере, включая подставленные classId/itemId/studentId; скрытия кнопок недостаточно. Приватная заметка анкеты доступна только учителю.
- Слот урока уникален по классу/дню/номеру, звонки не пересекаются. Выполнение меняет только ученик за себя. Автонаграды за 1/5/10 выполненных заданий; уникальные индексы и транзакции исключают повторы, снятие отметки не удаляет награду. Ручная награда учителя требует выполнения.

## Окружение и мобильная сборка

- `.env.example`, `README.md`, `docs/mobile.md` описывают запуск. Сервер: `HOST`, `PORT`, `DB_PATH`, `NODE_ENV`, `ALLOWED_ORIGINS`; оператор сброса: `PUBLIC_URL`. `npm start` сам `.env` не загружает.
- Все изменяющие API-запросы требуют точного разрешённого `Origin`; production без `ALLOWED_ORIGINS` отклоняет изменения. Native origins: `capacitor://localhost`, `http://localhost`. Для production нужны HTTPS и постоянный том; один экземпляр сервера на БД.
- Для веб-сборки `VITE_API_URL` пустой (same origin). Native требует `VITE_API_URL` и `VITE_WEB_URL` — публичные HTTPS origins без пути; секреты в `VITE_*` не хранить.
- `scripts/mobile.mjs`: `npm run mobile:sync` валидирует URL, собирает веб и синхронизирует `ios/`, `android/`; `mobile:android` собирает debug APK, `mobile:ios` — unsigned simulator app. Настройки — `capacitor.config.ts`, assets — `dist/`.
- `npm run mobile:local -- --android` / `--ios` — только локальный smoke с loopback и разрешённым cleartext. После него перед распространением нужен production sync; для веба заново `npm run build` без native URL. Подробности JDK/SDK, adb reverse, подписи и артефактов — `docs/mobile.md`; результаты проверок — `docs/validation.md`.

## Fly.io

- Исходный код: https://github.com/ayudenko/class-rep. `fly.toml`: приложение `klassno-school-ayudenko`, регион `fra`, `shared-cpu-1x`/512 MB, том `klassno_data` 1 GB в `/data`; `DB_PATH=/data/klassno/klassno.sqlite`. Держать один экземпляр: SQLite не реплицируется между Machines.
- `flyctl deploy --remote-only --ha=false`; диагностика — `flyctl status`, `flyctl checks list`, `flyctl logs`. Настроены HTTPS, отключён autostop, probe `/api/health` проверяет SQLite без авторизации и не выдаёт данные пользователей.
- Docker собирает веб отдельно; `docker/entrypoint.sh` готовит только `/data/klassno` и файлы БД, ограничивает права, отклоняет symlink и запускает сервер как `node` через gosu. Не заменять production путь локальным `data/klassno.sqlite` и не удалять том при обновлении.

## Проверки и ограничения

- `tests/auth.test.mjs`, `schedule.test.mjs`, `homework.test.mjs`, `health.test.mjs`: настоящие HTTP-запросы supertest к `createApp`, SQLite в памяти/временном файле; проверяют роли, чужие идентификаторы, жизненный цикл аккаунта, конфликты и награды. Мутациям в тестах нужен Origin. Listener требует разрешения среды; EPERM не означает дефект API.
- После изменений проверять затронутый HTTP-шов и `npm run build`; адаптивный UI проверять браузером. Успешная native сборка не подтверждает runtime на устройстве, публичное развёртывание или публикацию в магазинах.
<!-- autopilot:end -->
