13:20 BAR — LEADERBOARD WORKER · деплой за 5 минут

Нужен Node.js. В папке worker/ выполни по порядку:

1) Логин (откроется браузер):
   npx wrangler login

2) Создать KV-хранилище для рекордов:
   npx wrangler kv namespace create SCORES
   -> команда напечатает id = "xxxxxxxx". Скопируй его.

3) Вставь этот id в wrangler.toml вместо PASTE_YOUR_KV_NAMESPACE_ID_HERE

4) Задеплой:
   npx wrangler deploy
   -> получишь адрес вида  https://1320-scores.<твой-субдомен>.workers.dev

5) Скопируй этот адрес и вставь его в index.html — там наверху скрипта
   есть строка:  const SCORE_API = "";  — впиши туда адрес Worker.
   Перезалей index.html в репо.

Готово. Рекорды теперь общие: топ-10 с именами виден всем гостям.

Тарифы: бесплатного плана Cloudflare (100k запросов/день) для бара хватает с огромным запасом.
