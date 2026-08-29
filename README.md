# Golt website

Pre-launch website for Golt.

## Run locally

```text
npm install
npm run dev
```

## Waitlist connection

Copy `.env.example` to `.env` and set `VITE_WAITLIST_ENDPOINT` to an HTTPS endpoint that accepts a JSON `POST` body containing an `email` field. When the setting is missing, the form stays visibly disabled and does not pretend to collect addresses.

## Production build

```text
npm run build
```
