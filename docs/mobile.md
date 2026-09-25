# Сборка мобильных приложений

Нужны Node >=22.13, зависимости `npm ci`; Android — JDK21, Android SDK36; iOS — Xcode с iOS SDK и доступным simulator runtime для запуска. Используются Capacitor8.5.2, Swift Package Manager и стандартные native проекты. App ID: school.klassno.app (перед публикацией выберите принадлежащий вам идентификатор).

## С публичным сервером

Веб и API развёрнуты на https://klassno-school-ayudenko.fly.dev. В ALLOWED_ORIGINS уже включены `capacitor://localhost,http://localhost`. Для собственного сервера замените оба адреса и настройте эти origins на сервере.

```sh
export VITE_API_URL='https://klassno-school-ayudenko.fly.dev'
export VITE_WEB_URL='https://klassno-school-ayudenko.fly.dev'
npm run mobile:sync
npx cap open android
npx cap open ios
```

Можно записать обе переменные в `.env.production.local`. `mobile:sync` валидирует адреса, строит веб и синхронизирует оба проекта; URL без HTTPS, с credentials, путём, query/hash или loopback отклоняется. Фактическую доступность сервера и его TLS нужно проверить отдельно. API base — origin без `/api`. VITE_WEB_URL используется в приглашениях родителям. Приглашения открываются в браузере; universal/app links не настроены. Встроенные web assets используются без удалённого development server.

Android debug build с этими адресами: `npm run mobile:android`. Текущий проверенный APK собран с этим HTTPS API и `cleartext=false`; размер и SHA256 — в [результатах проверки](validation.md). iOS unsigned simulator build: `npm run mobile:ios`. Для release используйте заново `mobile:sync` с реальными адресами и штатную процедуру подписания Android Studio/Xcode. Не используйте результат локального smoke build как релиз. Ни ключи подписи, ни developer account в проект не включены.

## Только локальная проверка сборки

```sh
export JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home'
export ANDROID_HOME="$HOME/Library/Android/sdk"
export GRADLE_USER_HOME=/private/tmp/school-class-gradle
npm run mobile:local -- --android
npm run mobile:local -- --ios
```

Это отдельный **debug smoke**: API http://127.0.0.1:3000, web http://localhost:5173, Android разрешает cleartext. Эта локальная сборка не обращается к публичному серверу. Android эмулятор/USB устройство потребует `adb reverse tcp:3000 tcp:3000` и работающий `npm run dev` на компьютере. Приглашения с localhost открываются только на том же компьютере, не на телефоне другого человека. iOS simulator использует loopback компьютера; реальное iOS устройство — нет. Runtime на устройствах необходимо проверять отдельно. Native проекты после smoke содержат тестовые assets; перед распространением обязательно повторите production `mobile:sync`.

Артефакты: Android `android/app/build/outputs/apk/debug/app-debug.apk`; iOS при `npm run mobile:ios` — `ios/build/Build/Products/Debug-iphonesimulator/App.app`. iOS simulator .app не устанавливается на обычный iPhone, APK debug не является выпуском для Google Play. После native сборок верните веб-dist командой `npm run build` без VITE_API_URL.
