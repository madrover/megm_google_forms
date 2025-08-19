# 📋 Automatització per Formularis de Google

Aquest projecte conté un motor comú (`form-utils.js`) que permet processar respostes de **Formularis de Google** on s’hi adjunten arxius. El motor:

- Desa els fitxers enviats dins la carpeta del Formulari.
- Crea subcarpetes per cada **grup** (`Unitat/Grup`).
- Reanomena els arxius amb el nom, primer llinatge i segon llinatge del participant.
- Evita feina manual i errors humans.

## 📂 Estructura

- `form-utils.js` → Fitxer principal amb la lògica compartida (**no l’heu de modificar**).
- `loader-sample.js` → Exemple de codi mínim que cada Formulari ha de tenir, amb la configuració específica.

## 🚀 Com configurar un Formulari nou

1. Obriu el vostre **Formulari de Google**.
2. Aneu a **Extensions → Apps Script**.
3. Creeu un fitxer nou i enganxeu-hi el contingut de `loader-sample.js`.
4. **Editeu la configuració (`config`)** dins el codi perquè coincideixi amb els títols exactes de les preguntes del vostre formulari.  
   Exemple:
   ```javascript
   const config = {
     nameFields: {
       firstName: 'Nom del participant',
       firstSurname: 'Primer llinatge',
       secondSurname: 'Segon llinatge'
     },
     groupField: 'Unitat',
     fileFields: [
       'Autorització',
       'Foto',
       'DNI',
       'Targeta sanitària',
       'Llibre de vacunes'
     ]
   };
   ```

5. Deseu els canvis.
6. Executeu manualment la funció **`installTriggerForThisForm`**:
   - A la barra superior, seleccioneu la funció.
   - Cliqueu ▶️ *Executar*.
   - Google us demanarà permisos → accepteu.
7. El formulari ja està configurat ✅. Cada vegada que un usuari enviï respostes amb arxius:
   - Es crearan subcarpetes pel camp *Unitat/Group*.
   - Els fitxers quedaran reanomenats i ben organitzats.

## ℹ️ Notes Importants
- **Els noms de les preguntes han de coincidir exactament!**. Si canvieu el text d’una pregunta al Formulari, també l’heu d’actualitzar al `config`.  
- El repositori és la font de veritat. Tot el codi compartit està a `form-utils.js` i **no s’ha de copiar manualment** dins cada Formulari. El codi es carrega automàticament des de GitHub.
- En cas que canvieu la lògica, només cal actualitzar `form-utils.js`. Tots els formularis utilitzaran la versió nova de forma automàtica.

## 🛠 Exemple d’ús
Respostes:
- **Nom:** Maria  
- **Primer llinatge:** Garcia  
- **Segon llinatge:** Llull  
- **Unitat:** Ferrerets  

Fitxer pujat: *DNI.pdf*

Resultat:  
`Ferrets/DNI - Maria Garcia Llull 1.pdf`

---

## 👤 Per a qui està pensat
Aquest sistema està pensat per a organitzacions que només necessiten preparar 1–2 formularis a l’any.  
Els passos són curts, repetibles i no requereixen coneixements tècnics avançats.
