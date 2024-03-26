# SMTP / Graph Gateway

Converte email smtp in messaggi di testo per Microsoft Graph API.

## Configurazione

1. Copiare i certificati SSL nella cartella `certs` con i nomi `cert.pem` e `key.pem`. (se non disponibili, generare una coppia di chiavi con il comando `openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`).
2. Creare un file .env con le seguenti variabili:

```
MAIL_SERVICE_GRAPH_CLIENT_ID=
MAIL_SERVICE_GRAPH_CLIENT_SECRET=
MAIL_SERVICE_GRAPH_TENANT_ID=
MAIL_SERVICE_GRAPH_USER_FROM=
HOSTNAME=
DEFAULT_USERNAME=
DEFAULT_PASSWORD=
```

3. Eseguire il comando `npm install` per installare le dipendenze.
4. Eseguire il comando `npm start` per avviare il server. oppure
5. Eseguire il comando `npm run build` per compilare il progetto.
