# 📋 Automatització de pujada de fitxers per Formularis de Google

Aquest projecte conté un automatizació que permet processar respostes de **Formularis de Google** on s’hi adjunten arxius. Aquesta automatització:

- Desa els fitxers enviats dins la carpeta del Formulari.
- Crea subcarpetes per cada **grup** (`Unitat/Grup`).
- Reanomena els arxius amb el nom, primer llinatge i segon llinatge del participant.
- Evita feina manual i errors humans.

Podeu trobar un exemple de formulari en aquesta [carpeta de Google Drive](https://drive.google.com/drive/folders/18kvUen6DzuDJLB1so9JTYhUf9UW7q8Fw?usp=sharing).

## 📂 Estructura

- `form-utils.js` → Fitxer principal amb la lògica compartida (**no l’heu de modificar**).
- `loader-sample.js` → Exemple de codi mínim que cada Formulari ha de tenir, amb la configuració específica.

## 🚀 Com configurar un Formulari nou


La manera més sencilla de procedir és copiar un formulari existent, però per configurar un formulari nou s'han de seguir els següents passos.

**Consell:** Si la vostra organització té diversos agrupaments que utilitzen la mateixa estructura, podeu fer servir “Fer una còpia” del formulari original a Google Drive i després modificar només la configuració (`config`) i les preguntes necessàries.

1. Obriu el vostre **Formulari de Google**.
2. Aneu a **Extensions → Apps Script**.
3. Creeu un fitxer nou i enganxeu-hi el contingut de `loader-sample.js`.
4. **Editeu la configuració (`config`)** dins el codi perquè coincideixi amb els títols exactes de les preguntes del vostre formulari.
   Exemple:
   ```javascript
   const config = {
     nameFields: {
       firstName: 'Nom del nin, nina o jove',
       firstSurname: 'Primer llinatge del nin, nina o jove',
       secondSurname: 'Segon llinatge'
     },
     groupField: 'Unitat',
     fileFields: [
       'Autorització signada',
       'DNI',
       'Fotografia',
       'Targeta sanitària',
       'Llibre de vacunes'
     ]
   };
   ```
5. **Configureu els permisos del projecte Apps Script**:

    - Al menú lateral de l’editor d’Apps Script, aneu a **Project Settings** i activeu l’opció per veure el fitxer `appsscript.json`.
    - Podeu trobar un exemple del fitxer al vostre projecte (`appsscript.json`).
    - Afegiu (o comproveu que existeixen) els següents permisos dins el bloc `oauthScopes`:
      ```json
      "oauthScopes": [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/forms.currentonly",
        "https://www.googleapis.com/auth/script.external_request",
        "https://www.googleapis.com/auth/script.scriptapp"
      ]
      ```
    - Deseu el fitxer.


6. Deseu els canvis al projecte general.
7. Executeu manualment la funció **`installTriggerForThisForm`**:
   - A la barra superior, seleccioneu la funció.
   - Cliqueu ▶️ *Executar*.
   - Google us demanarà permisos → accepteu **tots els permisos sol·licitats**.

8. El formulari ja està configurat ✅. Cada vegada que un usuari enviï respostes amb arxius:
   - Es crearan subcarpetes pel camp *Unitat/Group*.
   - Els fitxers quedaran reanomenats i ben organitzats.








## 🛠 Exemple d’ús

Respostes:
- **Nom:** Maria
- **Primer llinatge:** Garcia
- **Segon llinatge:** Llull
- **Unitat:** Ferrerets



Fitxers pujats:
- *DNI.pdf*
- *DNI_2.pdf*
- *Autorització.pdf*
Resultat:

```
Ferrerets/DNI - Maria Garcia Llull 1.pdf
Ferrerets/DNI - Maria Garcia Llull 2.pdf
Ferrerets/Autorització - Maria Garcia Llull 1.pdf
```
Cada fitxer pujat (encara que sigui al mateix camp de pujada, per exemple múltiples fitxers de DNI), rebrà un número correlatiu.

---

## ℹ️ Notes Importants

- **Els noms de les preguntes han de coincidir exactament!** Si canvieu el text d’una pregunta al Formulari, també l’heu d’actualitzar al `config`.
- **Permisos d’autorització:** cal afegir les `oauthScopes` esmentades a `appsscript.json` i reautoritzar el projecte quan es faci la primera instal·lació o canvi de permisos.
- La instal·lació del trigger s’ha de repetir si es fa una còpia d’un formulari nou, perquè el trigger només s’aplica al projecte/fitxer específic.
- El repositori és la font de veritat. Tot el codi compartit està a `form-utils.js` i **no s’ha de copiar manualment** dins cada Formulari. El codi es carrega automàticament des de GitHub.
- En cas que canvieu la lògica, només cal actualitzar `form-utils.js`. Tots els formularis utilitzaran la versió nova de forma automàtica.

---

## 🧑‍💻 Monitorització

- Pots veure totes les execucions del script dins de **Extensions → Apps Script → "Executions"**.
- Aquí trobaràs informació detallada de cada execució, missatges informatius i possibles errors pel processament d’arxius.
- Si hi ha alguna incidència, consulta aquests missatges per ajudar a identificar i resoldre el problema.

---

## 👤 Per a qui està pensat

Aquest sistema està pensat per a organitzacions que només necessiten preparar 2-3 formularis a l’any.
Els passos són curts, repetibles i no requereixen coneixements tècnics avançats.
