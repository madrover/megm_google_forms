/**
 * Load the shared utilities from GitHub.
 */
function loadUtils() {
  var url = 'https://raw.githubusercontent.com/madrover/megm_google_forms/stable/form-utils.js';
  var code = UrlFetchApp.fetch(url).getContentText();
  eval(code);
}

/**
 * Main submit handler for this form.
 */
function onFormSubmit(e) {
  loadUtils();

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

  handleFormSubmit(e, config);
}

/**
 * Install trigger easily (run once from Script Editor).
 */
function installTriggerForThisForm() {
  loadUtils();
  installTrigger();
}
