# LOT EMPIRE — Render Mobile v3

Versione pronta per Render come **Web Service Node.js**. La cartella `assets/` resta nella posizione originale e non deve essere spostata.

## Pubblicazione su Render

1. Carica nel repository il contenuto di questa cartella, mantenendo `package.json`, `server.js`, `render.yaml`, `index.html`, `style.css`, `game.js` e `assets/` tutti nella root.
2. Su Render scegli **New → Web Service** e collega il repository.
3. Runtime: **Node**.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Health Check Path: `/health`

In alternativa, Render può leggere automaticamente `render.yaml` tramite **New → Blueprint**.

## Perché prima appariva “Not Found”

La vecchia versione era un sito statico senza configurazione esplicita del percorso di pubblicazione. Questa versione avvia un server Node che serve `index.html`, tutti i file dentro `assets/` e usa `index.html` come fallback per qualsiasi percorso.

## Test locale

```bash
npm start
```

Poi apri `http://localhost:3000`.

## Smartphone verticale

La pagina è ottimizzata per portrait:

- gioco posizionato nella parte alta;
- rulli ridimensionati senza spostare gli asset;
- comandi compatti e adatti al tocco;
- console inferiore con Litterio, statistiche, istruzioni e simboli speciali;
- supporto all'area sicura inferiore degli iPhone.

Crediti esclusivamente virtuali. Demo tecnica.
