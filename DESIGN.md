# 🏗️ Disseny Tècnic del Sistema de Formularis

Aquest document descriu l’arquitectura, les decisions de disseny i el flux de treball establert per tal de gestionar múltiples Formularis de Google amb un motor de codi compartit.

---

## 🔹 Filosofia General

- **Separació entre lògica i configuració**
  - La **lògica comuna** (processament de respostes, creació de carpetes, renombrat de fitxers, gestió del trigger) resideix en un únic fitxer: `form-utils.js`.
  - Cada formulari només conté una **configuració mínima** (els camps específics i els noms exactes de les preguntes).

- **Carrega dinàmica del codi**
  - Els formularis obtenen sempre el codi central directament des de GitHub (`UrlFetchApp` + `eval`).
  - Això permet que totes les millores o correccions aplicades a `form-utils.js` estiguin disponibles a tots els formularis automàticament.

---

## 🔹 Components Principals

1. **Motor compartit (`form-utils.js`)**
   - `handleFormSubmit(e, config)` → Processa les respostes segons la configuració de cada formulari.
   - Funcions utilitàries (`getResponseByTitle`, `processResponseFiles`, `getFilePath`…).
   - `installTrigger()` → Instal·la de manera idempotent el trigger *onFormSubmit* per garantir que només existeix un cop.

2. **Loader dins cada formulari**
   - `loadUtils()` → Carrega el codi central des de GitHub.
   - `onFormSubmit(e)` → Defineix la configuració específica (els camps, els noms de les preguntes) i invoca `handleFormSubmit()`.
   - `installTriggerForThisForm()` → Posa a disposició dels usuaris no tècnics una funció per instal·lar el trigger simplement fent clic a *Executar*.

---

## 🔹 Flux de Funcionament

1. Un usuari respon al formulari i adjunta fitxers.
2. Google Forms dispara l’event `onFormSubmit`.
3. El loader del formulari:
   - Carrega `form-utils.js` des de GitHub (tag `stable`).
   - Passa la configuració pròpia del formulari a `handleFormSubmit()`.
4. El motor comú:
   - Llegeix els camps configurats (`Nom`, `Primer llinatge`, `Segon llinatge`, `Grup`).
   - Crea o localitza la subcarpeta de grup dins de la carpeta del formulari.
   - Dins la carpeta de grup, crea o localitza una subcarpeta amb el nom complet del participant
     (ex. `Ferrerets/Maria Garcia Llull/`).
   - Mou i reanomena els fitxers segons l’esquema:
     ```
     <Unitat>/<Nom> <Primer Llinatge> <Segon Llinatge>/<Camp-de-fitxer> - <Nom> <Primer Llinatge> <Segon Llinatge> <N>.<extensió>
     ```
   - Exemple pràctic:
     ```
     Ferrerets/Maria Garcia Llull/DNI - Maria Garcia Llull 1.pdf
     Ferrerets/Maria Garcia Llull/Autorització - Maria Garcia Llull 1.pdf
     ```

---

## 🔹 Decisions de Disseny

- **Centralització** → Tota la lògica complexa és comuna i es troba a GitHub → mantenibilitat i coherència.
- **Simplicitat per a no tècnics** → Els administradors només han de copiar el loader, editar el bloc `config`, i executar `installTriggerForThisForm` un cop.
- **Escalabilitat** → És fàcil crear diversos formularis amb configuracions diferents sense duplicar lògica.
- **Idempotència** → El trigger només s’instal·la si no existeix ja.

---

## 🔹 Ús del Tag `stable`

Per garantir estabilitat i previsibilitat:

- Els formularis **sempre carreguen el codi des del tag `stable`**:
  ```
  https://raw.githubusercontent.com/<usuari>/<repo>/stable/form-utils.js
  ```

- **Flux de treball per actualitzar el motor**:
  1. Desenvolupar i provar els canvis a la branca `main`.
  2. Quan es validin, moure el tag `stable` al commit correcte:
     ```bash
     git tag -f stable
     git push origin stable -f
     ```
  3. Tots els formularis començaran a utilitzar la versió actualitzada automàticament.

- **Avantatges**:
  - Els usuaris finals (gestors del formulari) no han de fer res per obtenir millores.
  - Els formularis no es trenquen amb canvis experimentals, ja que només el codi validat es publica a `stable`.
  - Possibilitat de crear tags addicionals per versions anuals o específiques, ex. `stable-2025`, `stable-2026`.

---

## 🔹 Resum

- **Un motor central (form-utils.js)** versionat a GitHub.
- **Loader i configuració mínima** a cada formulari.
- **Instal·lació senzilla per a usuaris no tècnics** mitjançant `installTriggerForThisForm()`.
- **Tag `stable`** assegura que la lògica comuna que carreguen els formularis sempre és la versió provada i garantida.
