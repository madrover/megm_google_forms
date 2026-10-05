/**
 * Generic handler to process a form submission.
 *
 * - Called by the trigger (with `e`): processes the submitted response.
 * - Run manually from the Script Editor (without `e`): processes ALL the
 *   responses of the form. This recovers responses sent before the trigger
 *   was installed. It is safe to run it several times.
 *
 * @param {GoogleAppsScript.Events.FormsOnFormSubmit} e - The form submit event.
 * @param {Object} config - Form-specific configuration.
 */
function handleFormSubmit(e, config) {
  if (e && e.response) {
    processResponse(e.response, config);
  } else {
    processAllResponses(config);
  }
}

/**
 * Process every response of the active form.
 * Idempotent: folders are found by name and file names are deterministic.
 */
function processAllResponses(config) {
  const responses = FormApp.getActiveForm().getResponses();
  console.info(`INFO: Es processaran ${responses.length} respostes.`);

  let ok = 0;
  responses.forEach(response => {
    if (processResponse(response, config)) ok++;
  });

  console.info(`INFO: Fet. ${ok} de ${responses.length} respostes processades correctament.`);
}

/**
 * Process a single form response: create the group and person folders,
 * then move and rename the uploaded files.
 * A script lock prevents duplicate folders when two responses arrive at once.
 * @return {boolean} true if the response was processed.
 */
function processResponse(response, config) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const responses = response.getItemResponses();

    // Capture respondent details
    const name = getAnswer(responses, config.nameFields.firstName);
    const firstSurname = getAnswer(responses, config.nameFields.firstSurname);
    const secondSurname = config.nameFields.secondSurname
      ? getAnswer(responses, config.nameFields.secondSurname)
      : '';
    const group = getAnswer(responses, config.groupField);

    const missing = [
      [config.nameFields.firstName, name],
      [config.nameFields.firstSurname, firstSurname],
      [config.groupField, group]
    ].filter(([, value]) => !value).map(([title]) => `"${title}"`);
    if (missing.length > 0) {
      console.error(`ERROR: A la resposta del ${response.getTimestamp()} falta ${missing.join(', ')}. ` +
        'Comprovau que el títol de la pregunta coincideix exactament amb el config. Resposta no processada.');
      return false;
    }

    // Get or create the group folder and, inside it, the person folder
    const formFolder = DriveApp.getFileById(FormApp.getActiveForm().getId()).getParents().next();
    const groupFolder = getOrCreateFolder(formFolder, group);
    if (!groupFolder) return false;
    const personName = cleanName(`${name} ${firstSurname} ${secondSurname}`);
    const personFolder = getOrCreateFolder(groupFolder, personName);
    if (!personFolder) return false;

    // Process each configured file field
    config.fileFields.forEach(field => {
      const itemResponse = getResponseByTitle(responses, field);
      if (itemResponse) {
        processResponseFiles(itemResponse, personFolder, personName);
      } else {
        console.info(`INFO: Sense fitxers a "${field}" per a ${personName}.`);
      }
    });
    return true;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Find a response by form item title.
 */
function getResponseByTitle(responses, title) {
  return responses.find(itemResponse => itemResponse.getItem().getTitle() === title);
}

/**
 * Get the cleaned text answer of an item, or '' if it was not answered.
 */
function getAnswer(responses, title) {
  const itemResponse = getResponseByTitle(responses, title);
  return itemResponse ? cleanName(String(itemResponse.getResponse())) : '';
}

/**
 * Trim and collapse repeated spaces, so "Maria " and "Maria" share a folder.
 */
function cleanName(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Find a subfolder by name or create it.
 * @return {GoogleAppsScript.Drive.Folder|null}
 */
function getOrCreateFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  try {
    const folder = parent.createFolder(name);
    console.info(`INFO: Carpeta creada: ${name}`);
    return folder;
  } catch (error) {
    console.error(`ERROR: No s'ha pogut crear la carpeta "${name}". Error: ${error.message}`);
    return null;
  }
}

/**
 * Process and rename uploaded files.
 * Files are moved into the participant's folder inside the group.
 */
function processResponseFiles(itemResponse, personFolder, personName) {
  const response = itemResponse.getResponse();
  const responseTitle = itemResponse.getItem().getTitle();

  if (Array.isArray(response) && response.length > 0) {
    for (let i = 0; i < response.length; i++) {
      try {
        const file = DriveApp.getFileById(response[i]);
        const parts = file.getName().split('.');
        const extension = parts.length > 1 ? '.' + parts.pop() : '';
        const newName = getFreeName(personFolder, file, cleanName(`${responseTitle} - ${personName}`), extension);

        // Move + rename
        file.moveTo(personFolder).setName(newName);
        console.info(`INFO: Fitxer desat a: ${getFilePath(file)}`);
      } catch (error) {
        console.error(`ERROR: No s'ha pogut moure el fitxer de "${responseTitle}" de ${personName}. Error: ${error.message}`);
      }
    }
  } else {
    console.info(`INFO: Sense fitxers a "${responseTitle}" per a ${personName}.`);
  }
}

/**
 * First "<base> <N><extension>" name whose "<base> <N>" is not used by
 * another file in the folder (whatever its extension). Avoids duplicate names when a person submits the
 * form twice, and keeps the same name when a response is processed again.
 */
function getFreeName(folder, file, base, extension) {
  // Names used by other files, without extension ("DNI - Maria Garcia Llull 1")
  const taken = new Set();
  const files = folder.getFiles();
  while (files.hasNext()) {
    const other = files.next();
    if (other.getId() !== file.getId()) taken.add(other.getName().replace(/\.[^.]*$/, ''));
  }
  for (let n = 1; ; n++) {
    if (!taken.has(`${base} ${n}`)) return `${base} ${n}${extension}`;
  }
}

/**
 * Get the full file path inside Drive.
 */
function getFilePath(file) {
  let path = [];
  let currentFolder = file.getParents().next();
  while (currentFolder) {
    path.unshift(currentFolder.getName());
    const parents = currentFolder.getParents();
    if (parents.hasNext()) {
      currentFolder = parents.next();
    } else {
      break;
    }
  }
  path.push(file.getName());
  return path.join('/');
}

/**
 * Whether the form submit trigger is installed for the active form.
 */
function hasTrigger() {
  const form = FormApp.getActiveForm();
  return ScriptApp.getProjectTriggers().some(t =>
    t.getHandlerFunction() === 'onFormSubmit' &&
    t.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
    t.getTriggerSourceId() === form.getId()
  );
}

/**
 * Report whether the trigger is installed and whether every title in the
 * config exists in the form.
 * @return {boolean} true if there are no errors.
 */
function checkSetup(config) {
  let ok = true;

  if (hasTrigger()) {
    console.info('OK: L\'automatització està activada.');
  } else {
    console.error('ERROR: L\'automatització NO està activada. Executau installTriggerForThisForm.');
    ok = false;
  }

  const titles = FormApp.getActiveForm().getItems().map(item => item.getTitle());
  const required = [config.nameFields.firstName, config.nameFields.firstSurname, config.groupField];
  const optional = (config.nameFields.secondSurname ? [config.nameFields.secondSurname] : [])
    .concat(config.fileFields);

  required.forEach(title => {
    if (!titles.includes(title)) {
      console.error(`ERROR: El formulari no té cap pregunta "${title}". Corregiu el títol al formulari o al config.`);
      ok = false;
    }
  });
  optional.forEach(title => {
    if (!titles.includes(title)) {
      console.warn(`AVÍS: El formulari no té cap pregunta "${title}"; s'ignorarà.`);
    }
  });

  if (ok) console.info('OK: Les preguntes del formulari coincideixen amb el config.');
  return ok;
}

/**
 * Install a form submit trigger (safe to run multiple times), then check
 * the setup when the loader defines a global `config`.
 */
function installTrigger() {
  if (!hasTrigger()) {
    ScriptApp.newTrigger('onFormSubmit')
      .forForm(FormApp.getActiveForm())
      .onFormSubmit()
      .create();
    console.info('INFO: Automatització activada correctament.');
  } else {
    console.info('INFO: L\'automatització ja estava activada.');
  }

  if (typeof config !== 'undefined') {
    checkSetup(config);
  }
}
