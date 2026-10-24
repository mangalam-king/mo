/**
 * Run once in Google Apps Script to configure the EXISTING MO Olympiad form.
 * This does not create a duplicate form.
 */
function configureExistingMOOlympiadQuiz() {
  const form = FormApp.openById('1A3MXa8Dngb6LJady6PAytgttkkEEyhR5TEgNHIrWzEA');

  // Enable automatic scoring for questions that already have answer keys and points.
  form.setIsQuiz(true);

  // Collect the respondent's Google account email and allow only one response per account.
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);

  form.setConfirmationMessage('Your MO Olympiad response has been submitted. You cannot submit a second response using the same Google account.');

  Logger.log('MO Olympiad form settings updated.');
  Logger.log('Student link: ' + form.getPublishedUrl());
  Logger.log('Admin link: ' + form.getEditUrl());
}
