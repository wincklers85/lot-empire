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

## Profilo vincite frequenti

Questa versione carica `math-config.js` prima di `game.js`.
Il parametro principale è:

```js
lossToSmallWinChance: 0.52
```

Aumentandolo verso `0.65` si vince ancora più spesso; riducendolo verso `0.30` il gioco diventa meno generoso.
Le vincite aggiuntive sono prevalentemente piccole e usano simboli bassi o medi.
Il gioco utilizza esclusivamente crediti virtuali.

## Versione v5 — Debugging e borsellino demo

- Pulsante **DEBUG** con modal "Debugging mode".
- Regolazione in tempo reale della frequenza delle piccole vincite, delle combinazioni Bonus, dei quattro simboli e del limite dei premi assistiti.
- Proiezione indicativa su 1.000 giocate e log del calcolo RNG dell'ultimo spin.
- Tre minigiochi Bonus alternati: Tesori dell'Impero, Ruota della Fortuna e Scelta Imperiale.
- Pulsanti **RISCUOTI** e **RICARICA** con voucher alfanumerico locale di 5 caratteri.
- I voucher e tutti i crediti sono esclusivamente virtuali, senza valore monetario, e vengono salvati nel browser tramite localStorage.


## Versione v6
- Pulsanti DEBUG, RISCUOTI e RICARICA sempre visibili in alto, anche su smartphone.
- Modal corretti con gestori eventi locali.
- Voucher compatti: importo in centesimi convertito in base 36 + 2 caratteri di controllo.
- Decodifica del valore visualizzata prima della ricarica.
- Compatibilità localStorage con fallback in memoria.


## Versione v7 Responsive VLT Demo
- credito iniziale 0
- avvio con €999 demo o codice voucher
- layout rulli 5×3 adattivo in verticale
- desktop a pagina intera
- quattro minigiochi alternati, incluso Litterio Empire
- animazione Wild dalla sprite sheet esistente
- tutti i crediti sono virtuali e senza valore monetario
