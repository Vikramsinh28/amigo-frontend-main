// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://api1.amigobuddy.com/ppi/',
  backendUrl: 'https://api1.amigobuddy.com/jpi/',
  //apiUrl: 'http://localhost:5000/api/',
  //backendUrl: 'http://localhost:8080/api/',
  beforeExpiry: 2,   // in minutes
  allowedImageUploadExtentions: 'png,jpg',
  allowedDocumentUploadExtentions: 'txt,pdf,doc,docx,xls,xlsx',
  autoSaveDraftTestPaper: 2,   // in minutes
  staticClient: 'eps'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
