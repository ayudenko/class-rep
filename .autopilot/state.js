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
  "updatedAt": "2026-09-25T13:10:42.878838+03:00",
  "finishedAt": "2026-09-25T13:10:42.878838+03:00",
  "stages": [
    {
      "id": "preflight",
      "status": "done",
      "startedAt": "2026-09-25T11:29:26.584069+03:00",
      "finishedAt": "2026-09-25T11:29:26.584069+03:00"
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
      "status": "done",
      "startedAt": "2026-09-25T12:54:47.964658+03:00",
      "note": "Веб опубликован, GitHub push выполнен; iOS остаётся открытым ограничением",
      "finishedAt": "2026-09-25T13:10:42.878838+03:00"
    }
  ],
  "requirements": {
    "total": 18,
    "done": 15,
    "inTicket": 0,
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
      "status": "done",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0,
      "wave": 4,
      "blockedBy": [
        "04"
      ],
      "commit": "92ce870",
      "tests": {
        "passed": 14,
        "failed": 0
      },
      "finishedAt": "2026-09-25T13:10:42.878838+03:00"
    }
  ],
  "singlePass": null,
  "tests": {
    "passed": 14,
    "failed": 0
  },
  "debt": {
    "placeholders": [
      "iOS бинарник: требуется первоначальная настройка и лицензия Xcode; native runtime ещё не проверен"
    ],
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
    "REPORT: iOS требует первого запуска Xcode с принятием лицензии владельцем Mac",
    "REPORT: Android debug APK подключён к публичному HTTPS API; native runtime и release подпись не проверены",
    "RESOLVED: Docker image успешно собран удалённо на Fly.io",
    "REPORT: Capacitor CLI dev-only chain имеет 3 moderate npm audit advisories",
    "REPORT: Публичный HTTPS работает из Fly VM; локальная сеть блокирует DNS/TLS, browser QA публичного адреса не подтверждена"
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
    "notes": "HTTP roles/classes/schedules/homework/awards/invites passed; native partial as manifest; root independently verified browser UI.",
    "matched": 13,
    "checked": 15,
    "mismatches": []
  },
  "deployment": {
    "url": "https://klassno-school-ayudenko.fly.dev",
    "repository": "https://github.com/ayudenko/class-rep",
    "branch": "master",
    "machine": "d8d5459a39d358",
    "region": "fra",
    "volume": "klassno_data",
    "smoke": "Public HTTPS auth/class persistence passed after restart; QA data removed; health200",
    "browserLimit": "Local DNS/TLS blocked public browser check"
  }
}
