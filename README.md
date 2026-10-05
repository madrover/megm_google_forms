# 📋 Automatització de pujada de fitxers per Formularis de Google

Quan una família o un cap envia un **formulari de Documentació** amb fitxers (DNI, autorització, fotografia…), aquesta automatització els ordena dins la carpeta del formulari, en una carpeta per **unitat** i, dins aquesta, una carpeta per **persona**, i reanomena cada fitxer:

```
Ferrerets/Maria Garcia Llull/DNI - Maria Garcia Llull 1.pdf
Ferrerets/Maria Garcia Llull/Autorització signada - Maria Garcia Llull 1.pdf
```

---

## ✅ Guia ràpida: activar l'automatització (5 minuts per formulari)

> [!IMPORTANT]
> Quan es fa una **còpia** d'un formulari, Google copia l'automatització però la deixa **apagada**. S'ha d'activar a mà a **cada formulari de Documentació** (el d'infants i joves i el de caps) de **cada agrupament**, cada vegada que es fa una còpia. Si no s'activa, els fitxers es guarden igualment, però sense ordenar.

Feis-ho amb el **compte propietari dels formularis** (el mateix amb què heu fet les còpies).

### 1. Obrir l'editor de l'automatització

1. Obriu el formulari de Documentació en mode edició.
2. Al menú **⋮** (tres punts, a dalt a la dreta), triau **Apps Script**. S'obre una pestanya nova amb el codi. **No heu de canviar res del codi.**

### 2. Activar-la

1. A la barra de dalt, al desplegable que hi ha al costat de **▶ Executa**, triau **`installTriggerForThisForm`**.
2. Premeu **▶ Executa**.
3. La primera vegada, Google demana permisos:
   1. **Revisa els permisos** → triau el compte propietari.
   2. Si surt **«Google no ha verificat aquesta aplicació»**, és normal (l'automatització és nostra, no d'una empresa externa): premeu **Configuració avançada** i després **Ves a … (no segur)**.
   3. Premeu **Permet**.
4. A baix s'obre el **Registre d'execució**. Ha de sortir:
   - `Automatització activada correctament` (o `ja estava activada`), i
   - `OK: Les preguntes del formulari coincideixen amb el config`.

   Si surt alguna línia **ERROR**, vegeu [Si alguna cosa no funciona](#-si-alguna-cosa-no-funciona).

### 3. Ordenar les respostes que ja s'havien enviat

Si el formulari ja tenia respostes abans d'activar-lo, aquestes respostes no s'ordenen soles:

1. Al mateix desplegable, triau **`onFormSubmit`** i premeu **▶ Executa**.
2. El registre mostra cada fitxer ordenat i, al final, `Fet. X de X respostes processades correctament`.

Es pot executar tantes vegades com vulgueu: el que ja està ordenat no es duplica.

### 4. Comprovar-ho

Enviau una resposta de prova al formulari. Al cap d'un minut ha d'aparèixer a la carpeta del formulari la carpeta de la unitat i, a dins, la de la persona amb els fitxers reanomenats. Després esborrau la resposta i la carpeta de prova.

### 🆘 Si alguna cosa no funciona

- **`ERROR: El formulari no té cap pregunta "..."`**: s'ha canviat el títol d'una pregunta. Torneu-lo a deixar exactament igual (majúscules, accents i espais inclosos) o avisau qui mantén l'automatització.
- **`ERROR: No s'ha pogut moure el fitxer...`**: normalment és un problema de permisos. Activau-la amb el compte propietari dels formularis.
- **Altres casos**: a l'editor d'Apps Script, al menú de l'esquerra, obriu **Execucions** (icona ≡▶), feis una captura de l'execució amb error i enviau-la a qui mantén l'automatització.

---

## 🛠 Informació tècnica

### Estructura

- `form-utils.js` → lògica compartida (**no s'ha de copiar dins els formularis**). Cada formulari la carrega de GitHub a cada execució.
- `loader-sample.js` → codi mínim que ha de tenir cada formulari, amb la configuració (`config`) pròpia.
- `appsscript.json` → manifest d'exemple amb els permisos necessaris.

### Funcions del loader

| Funció | Quan s'executa | Què fa |
| :-- | :-- | :-- |
| `installTriggerForThisForm` | A mà, una vegada per còpia | Activa el disparador d'enviament (si no hi és) i comprova que els títols del `config` existeixen al formulari |
| `onFormSubmit` | Automàticament a cada enviament | Ordena els fitxers de la resposta enviada |
| `onFormSubmit` | A mà | Ordena **totes** les respostes del formulari (recupera les enviades abans d'activar-la) |

### Configuració (`config`)

Els títols han de coincidir **exactament** amb els de les preguntes del formulari. Les preguntes de fitxer que no existeixin o no s'hagin respost s'ignoren.

Formulari de Documentació d'infants i joves:

```javascript
const config = {
  nameFields: {
    firstName: 'Nom del nin, nina o jove',
    firstSurname: 'Primer llinatge del nin, nina o jove',
    secondSurname: 'Segon llinatge del nin, nina o jove'
  },
  groupField: 'Unitat',
  fileFields: [
    'Autorització signada',
    'DNI',
    'Fotografia',
    'Targeta sanitària'
  ]
};
```

Formulari de Documentació de caps:

```javascript
const config = {
  nameFields: {
    firstName: 'Nom',
    firstSurname: 'Primer llinatge',
    secondSurname: 'Segon llinatge'
  },
  groupField: 'Unitat',
  fileFields: [
    'DNI',
    'Autorització, compromís i declaració responsable',
    'Certificat del Registre de Delinqüents Sexuals',
    'Curs de Protecció del Menor',
    'Monitor/a de temps lliure',
    'Director/a de temps lliure',
    'Carnet de socorrista (piscina)',
    'Carnet de socorrista (platja)'
  ]
};
```

### Configurar un formulari nou des de zero

Normalment no cal: és més senzill copiar un formulari que ja funcioni i seguir la [guia ràpida](#-guia-ràpida-activar-lautomatització-5-minuts-per-formulari).

1. Obriu el formulari → **⋮ → Apps Script**.
2. Enganxau el contingut de `loader-sample.js` i adaptau el `config` als títols del formulari.
3. A **Configuració del projecte** (⚙️), activau **Mostra el fitxer de manifest «appsscript.json» a l'editor** i comprovau que conté aquests permisos (vegeu `appsscript.json`):

   ```json
   "oauthScopes": [
     "https://www.googleapis.com/auth/drive",
     "https://www.googleapis.com/auth/forms.currentonly",
     "https://www.googleapis.com/auth/script.external_request",
     "https://www.googleapis.com/auth/script.scriptapp"
   ]
   ```

4. Desau i seguiu la [guia ràpida](#-guia-ràpida-activar-lautomatització-5-minuts-per-formulari) des del pas 2.

### Notes

- El disparador s'executa amb el compte de qui l'ha activat; aquest compte ha de poder moure els fitxers pujats, que són del propietari del formulari.
- Si canviau el títol d'una pregunta, actualitzau també el `config`.
- Podeu veure totes les execucions i els seus missatges a **Apps Script → Execucions**.
- Els detalls de disseny i el flux per publicar canvis són a [DESIGN.md](DESIGN.md).
