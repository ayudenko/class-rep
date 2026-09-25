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
  "updatedAt": "2026-09-25T12:30:36.703831+03:00",
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
      "status": "active",
      "startedAt": "2026-09-25T12:12:48.829524+03:00"
    },
    {
      "id": "review",
      "status": "active",
      "startedAt": "2026-09-25T12:20:24.805609+03:00",
      "note": "Проверка готового серверного ядра"
    },
    {
      "id": "final",
      "status": "pending"
    }
  ],
  "requirements": {
    "total": 15,
    "done": 0,
    "inTicket": 15,
    "inSpec": 0,
    "placeholder": 0,
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
      "status": "repair",
      "retries": 0,
      "repairs": 1,
      "handoffs": 0,
      "startedAt": "2026-09-25T12:12:48.829524+03:00",
      "repairFindings": [
        "При смене класса не показывать старые анкеты и игнорировать устаревшие ответы",
        "Истёкшая сессия возвращает интерфейс ко входу",
        "Generic login failure при коротком/пустом пароле — исправлен исполнителем"
      ]
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
      "status": "pending",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
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
      "status": "pending",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
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
      "status": "pending",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
    }
  ],
  "singlePass": null,
  "tests": null,
  "debt": {
    "placeholders": [],
    "assumptions": [],
    "emptyEnv": []
  },
  "additions": [],
  "coverage": {
    "found": 1,
    "fixed": 1,
    "deferred": 0,
    "note": "Уточнена обязательность native builds; отсутствие бинарника не считается закрытым требованием. Остальное — детализация исходных требований."
  },
  "concerns": [
    "Native invites require VITE_WEB_URL in deployment; T01 fix reported, rereview pending"
  ],
  "reviewers": {
    "manifestSpec": "/root/requirements_review",
    "craft": "/root/craft_review"
  },
  "blind": null
}
