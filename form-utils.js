/**
 * Generic handler to process a form submission.
 * @param {GoogleAppsScript.Events.FormsOnFormSubmit} e - The form submit event.
 * @param {Object} config - Form-specific configuration.
 */
function handleFormSubmit(e, config) {
  const form = FormApp.getActiveForm();
  const formFile = DriveApp.getFileById(form.getId());
  const formFolder = formFile.getParents().next();

  // Use latest response if e is missing
  const latestResponse = e ? e.response : form.getResponses().pop();
  const responses = latestResponse.getItemResponses();

  // Capture respondent details
  const name = getResponseByTitle(responses, config.nameFields.firstName).getResponse();
  const firstSurname = getResponseByTitle(responses, config.nameFields.firstSurname).getResponse();
  const secondSurname = config.nameFields.secondSurname
    ? (getResponseByTitle(responses, config.nameFields.secondSurname)?.getResponse() || '')
    : '';

  const group = getResponseByTitle(responses, config.groupField).getResponse();

  // Get or create the target folder for the group
  let groupFolder;
  const folders = formFolder.getFoldersByName(group);
  if (folders.hasNext()) {
    groupFolder = folders.next();
    console.info(`INFO: Found existing folder for group: ${group}`);
  } else {
    try {
      groupFolder = formFolder.createFolder(group);
      console.info(`INFO: Created new folder for group: ${group}`);
    } catch (error) {
      console.error(`ERROR: Failed to create folder "${group}". Error: ${error.message}`);
      return;
    }
  }

  // Process each configured file field
  config.fileFields.forEach(field => {
    const itemResponse = getResponseByTitle(responses, field);
    if (itemResponse) {
      processResponseFiles(itemResponse, groupFolder, name, firstSurname, secondSurname);
    } else {
      console.info(`INFO: File field "${field}" not found in the form response.`);
    }
  });
}

/**
 * Find a response by form item title.
 */
function getResponseByTitle(responses, title) {
  return responses.find(itemResponse => itemResponse.getItem().getTitle() === title);
}

/**
 * Process and rename uploaded files.
 */
function processResponseFiles(itemResponse, groupFolder, name, firstSurname, secondSurname) {
  const response = itemResponse.getResponse();
  const responseTitle = itemResponse.getItem().getTitle();

  if (Array.isArray(response) && response.length > 0) {
    for (let i = 0; i < response.length; i++) {
      try {
        const file = DriveApp.getFileById(response[i]);
        const parts = file.getName().split('.');
        const extension = parts.length > 1 ? '.' + parts.pop() : '';
        const newName = `${responseTitle} - ${name} ${firstSurname} ${secondSurname} ${i + 1}${extension}`
          .replace(/\s{2,}/g, ' ')
          .trim();

        console.info(`INFO: Processing file from "${responseTitle}" response, ID: ${file.getId()}, URL: ${file.getUrl()}`);

        // Move + rename
        file.moveTo(groupFolder).setName(newName);

        // Log success with full path
        const filePath = getFilePath(file);
        console.info(`INFO: File successfully processed and moved to: ${filePath}`);

      } catch (error) {
        console.error(`ERROR: Failed to process file from "${responseTitle}". Error: ${error.message}`);
      }
    }
  } else {
    console.info(`INFO: No files uploaded for "${responseTitle}".`);
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
 * Install a form submit trigger (safe to run multiple times).
 */
function installTrigger() {
  const form = FormApp.getActiveForm();
  const triggers = ScriptApp.getProjectTriggers();

  const exists = triggers.some(t =>
    t.getHandlerFunction() === 'onFormSubmit' &&
    t.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
    t.getTriggerSourceId() === form.getId()
  );

  if (!exists) {
    ScriptApp.newTrigger('onFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
    console.info('INFO: Trigger installed successfully.');
  } else {
    console.info('INFO: Trigger already exists. No new trigger installed.');
  }
}
