/**
 * Form configuration (edit this block to fit your form!)
 */
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
    'Targeta sanitària',
    'Llibre de vacunes'
  ]
};

/**
 * Load the shared utilities from GitHub.
 */
function getUtilsCode() {
  var url = 'https://raw.githubusercontent.com/madrover/megm_google_forms/stable/form-utils.js';
  var code = UrlFetchApp.fetch(url).getContentText();
  return code;
}

/**
 * Main submit handler for this form.
 */
function onFormSubmit(e) {
  eval(getUtilsCode());
  handleFormSubmit(e, config);
}

/**
 * Install trigger easily (run once from Script Editor).
 */
function installTriggerForThisForm() {
  eval(getUtilsCode());
  installTrigger();
}
