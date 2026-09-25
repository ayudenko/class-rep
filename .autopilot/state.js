window.STATE =
{
  "slug": "school-class",
  "title": "Пространство школьного класса",
  "mode": "semi",
  "depth": "normal",
  "polish": null,
  "tier": "T2",
  "briefFile": "2026-09-25-brief.md",
  "memoryFile": "AGENTS.md",
  "skillDir": "/Users/a.yudenko/.agents/skills/autopilot",
  "startedAt": "2026-09-25T11:29:26.584069+03:00",
  "updatedAt": "2026-09-25T13:01:41.495927+03:00",
  "finishedAt": null,
  "stages": [
    {
      "id": "preflight",
      "status": "done",
      "startedAt": "2026-09-25T11:29:26.584069+03:00"
    },
    {
      "id": "manifest",
      "status": "done",
      "startedAt": "2026-09-25T11:29:26.584069+03:00",
      "finishedAt": "2026-09-25T11:30:09.262772+03:00"
    },
    {
      "id": "briefing",
      "status": "done",
      "startedAt": "2026-09-25T11:30:09.262772+03:00",
      "finishedAt": "2026-09-25T12:10:49.054308+03:00"
    },
    {
      "id": "spec",
      "status": "done",
      "startedAt": "2026-09-25T12:10:49.054308+03:00",
      "finishedAt": "2026-09-25T12:12:48.829524+03:00"
    },
    {
      "id": "plan",
      "status": "done",
      "startedAt": "2026-09-25T12:12:48.829524+03:00",
      "finishedAt": "2026-09-25T12:12:48.829524+03:00",
      "note": "4 таска, T2, 3 волны"
    },
    {
      "id": "build",
      "status": "done",
      "startedAt": "2026-09-25T12:12:48.829524+03:00",
      "note": "Веб и Android debug готовы, iOS блокирован настройкой Xcode",
      "finishedAt": "2026-09-25T12:54:47.964658+03:00"
    },
    {
      "id": "review",
      "status": "done",
      "startedAt": "2026-09-25T12:20:24.805609+03:00",
      "note": "Все code reviews clean",
      "finishedAt": "2026-09-25T12:54:47.964658+03:00"
    },
    {
      "id": "final",
      "status": "active",
      "startedAt": "2026-09-25T12:54:47.964658+03:00",
      "note": "Дополнительный запрос пользователя: публикация Fly.io и push GitHub"
    }
  ],
  "requirements": {
    "total": 18,
    "done": 13,
    "inTicket": 2,
    "inSpec": 0,
    "placeholder": 3,
    "deferred": 0,
    "dropped": 0
  },
  "tickets": [
    {
      "id": "01",
      "title": "Аккаунты и пространство класса",
      "requirements": [
        "R02",
        "R03",
        "R04",
        "R12i",
        "G02",
        "G03"
      ],
      "blockedBy": [],
      "wave": 1,
      "zone": [
        "server/core",
        "src/core",
        "src/features/classroom",
        "root config",
        "tests/auth.test.mjs"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 1,
      "handoffs": 0,
      "startedAt": "2026-09-25T12:12:48.829524+03:00",
      "repairFindings": [
        "При смене класса не показывать старые анкеты и игнорировать устаревшие ответы",
        "Истёкшая сессия возвращает интерфейс ко входу",
        "Generic login failure при коротком/пустом пароле — исправлен исполнителем"
      ],
      "finishedAt": "2026-09-25T12:32:08.059884+03:00",
      "commit": "35191e9",
      "tests": {
        "passed": 7,
        "failed": 0
      }
    },
    {
      "id": "02",
      "title": "Расписание уроков и звонков",
      "requirements": [
        "R05",
        "R06"
      ],
      "blockedBy": [
        "01"
      ],
      "wave": 2,
      "zone": [
        "server/schedule.mjs",
        "src/features/schedule",
        "tests/schedule.test.mjs"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0,
      "startedAt": "2026-09-25T12:32:08.059884+03:00",
      "tests": {
        "passed": 13,
        "failed": 0
      },
      "finishedAt": "2026-09-25T12:41:09.972809+03:00",
      "commit": "742cf61"
    },
    {
      "id": "03",
      "title": "Домашние задания и награды",
      "requirements": [
        "R07",
        "R08",
        "R09",
        "R10",
        "R11"
      ],
      "blockedBy": [
        "01"
      ],
      "wave": 2,
      "zone": [
        "server/homework.mjs",
        "src/features/homework",
        "tests/homework.test.mjs"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 1,
      "handoffs": 0,
      "startedAt": "2026-09-25T12:32:08.059884+03:00",
      "repairFindings": [
        "POST success + refresh failure must not leave create form retry that duplicates homework"
      ],
      "finishedAt": "2026-09-25T12:43:09.617963+03:00",
      "commit": "3e5047a",
      "tests": {
        "passed": 13,
        "failed": 0
      }
    },
    {
      "id": "04",
      "title": "Веб и приложения: поставка и проверка",
      "requirements": [
        "R01",
        "G01",
        "G02"
      ],
      "blockedBy": [
        "02",
        "03"
      ],
      "wave": 3,
      "zone": [
        "capacitor.config.ts",
        "ios",
        "android",
        "docs",
        "README.md",
        "Dockerfile",
        "package scripts",
        "integration polish"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 1,
      "handoffs": 0,
      "startedAt": "2026-09-25T12:43:09.617963+03:00",
      "repairFindings": [
        "При активной сессии reset hash должен открывать форму восстановления — исправлено и проверено"
      ],
      "finishedAt": "2026-09-25T12:54:47.964658+03:00",
      "commit": "2b5f45d",
      "tests": {
        "passed": 13,
        "failed": 0
      },
      "concerns": [
        "Android debug APK built; iOS compilation blocked by Xcode first-launch/license; native runtime untested"
      ]
    },
    {
      "id": "05",
      "title": "Публикация Fly.io и GitHub",
      "requirements": [
        "G04",
        "G05"
      ],
      "status": "active",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
    }
  ],
  "singlePass": null,
  "tests": {
    "passed": 13,
    "failed": 0
  },
  "debt": {
    "placeholders": [
      "iOS бинарник: Xcode не содержит требуемый CoreSimulator.framework; исходный проект готов",
      "Публичный HTTPS сервер/домен пока не выбран; Android APK для локальной проверки"
    ],
    "assumptions": [],
    "emptyEnv": [
      "VITE_API_URL",
      "VITE_WEB_URL",
      "PUBLIC_URL",
      "ALLOWED_ORIGINS"
    ]
  },
  "additions": [],
  "coverage": {
    "found": 1,
    "fixed": 1,
    "deferred": 0,
    "note": "Уточнена обязательность native builds; отсутствие бинарника не считается закрытым требованием. Остальное — детализация исходных требований."
  },
  "concerns": [
    "REPORT: iOS требует первого запуска Xcode с принятием лицензии владельцем Mac",
    "REPORT: Android APK local-debug; native runtime и release подпись не проверены",
    "REPORT: Docker daemon отсутствует, образ не собран",
    "REPORT: Capacitor CLI dev-only chain имеет3moderate npm audit advisories"
  ],
  "reviewers": {
    "manifestSpec": "/root/requirements_review",
    "craft": "/root/craft_review"
  },
  "blind": {
    "agent": "/root/blind_acceptance",
    "verdict": "No blocking drift",
    "checks": 38,
    "tests": 13,
    "notes": "HTTP roles/classes/schedules/homework/awards/invites passed; native partial as manifest; root independently verified browser UI."
  }
}
