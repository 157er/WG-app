# WG-Split Monorepo

WG-Split ist eine Produktions-ready Beispielanwendung zum fairen Verwalten gemeinsamer Ausgaben in WGs, Haushalten und Reisegruppen. Das Projekt ist als pnpm-Monorepo aufgebaut und enthält eine Fastify/Prisma-API sowie eine React/Tailwind-Web-App.

## Projektstruktur

```
.
├── apps
│   ├── api        # Fastify + Prisma Backend (TypeScript)
│   └── web        # React + Vite Frontend (TypeScript)
├── packages
│   ├── config     # Gemeinsame Zod-Konfigurationen
│   ├── tsconfig   # Basis-TSConfig
│   └── ui         # Geteilte UI-Komponenten (Tailwind)
```

## Schnellstart

1. Abhängigkeiten installieren:
   ```bash
   pnpm install
   ```
2. .env anlegen (Beispiel siehe `.env.example`).
3. Datenbank-Migrationen ausführen und Seed laden:
   ```bash
   pnpm --filter @wg-split/api prisma:migrate
   pnpm --filter @wg-split/api seed
   ```
4. Entwicklung starten (Docker Compose optional für DB/Redis/Maildev):
   ```bash
   docker compose up -d
   pnpm --filter @wg-split/api dev
   pnpm --filter @wg-split/web dev
   ```

## Tests & Qualitätssicherung

- API Unit-Tests: `pnpm --filter @wg-split/api test`
- Web Unit-Tests: `pnpm --filter @wg-split/web test`
- Linting: `pnpm lint`
- Typprüfung: `pnpm typecheck`

Der CI-Workflow in `.github/workflows/ci.yml` führt Linting, Typecheck, Tests und Builds automatisiert aus.

## Docker & Infrastruktur

Das mitgelieferte `docker-compose.yml` startet folgende Services:
- `api` (Fastify)
- `web` (Vite Preview)
- `db` (PostgreSQL 16)
- `redis` (Redis 7 für BullMQ)
- `worker` (Hintergrundjobs)
- `maildev` (E-Mail Testing)

## API Dokumentation

- OpenAPI 3.1 Spec: `apps/api/openapi.yaml`
- Postman Collection: `apps/api/postman_collection.json`
- Swagger UI: nach Start der API unter `http://localhost:3333/docs`

## PDF & Exporte

- Periodenreport wird serverseitig via `@react-pdf/renderer` erzeugt.
- CSV-Export für Ausgaben.
- DSAR-Export (`/me/data-export`) erstellt Zip mit JSON/CSV.

## Testszenarien (Auszug)

- `splitEqual_3Members_rounding_ok`
- `splitWeighted_sum_equals_amount`
- `settlementGreedy_minTransactions_smallSets`
- `receipts_upload_validation_rejects_exe`
- `auth_magiclink_single_use`
- `permissions_admin_only_endpoints_403`
- `export_zip_contains_all_entities`
- `pwa_offline_queue_and_sync`

## Weitere Hinweise

- Magic-Link-Login nutzt Nodemailer (Maildev in Dev) und JWT.
- Wiederkehrende Ausgaben & Erinnerungen laufen über BullMQ Worker.
- Frontend unterstützt Offline-Erfassung: Ausgaben werden lokal gepuffert und nach Online-Rückkehr synchronisiert.
- DSGVO-konforme Features wie Datenexport, Löschbarkeit, Logging von sensiblen Aktionen sind vorbereitet.

Viel Spaß beim Testen! Feedback willkommen.
