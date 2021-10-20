The _services folder contains classes that handle all http communication with the backend API for the application, each service encapsulates the api calls for a feature (e.g. authentication) and exposes methods for performing various operations (e.g. CRUD operations, notifications etc). 

Services can also have methods that don't wrap http calls (e.g. authenticationService.logout()).