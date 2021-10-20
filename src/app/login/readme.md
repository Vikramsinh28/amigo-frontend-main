The login component contains all of the logic for validating the login form and handling form submission.

The constructor() method:

* specifies the dependencies that are required by the component as parameters, these are automatically injected by the Angular Dependency Injection (DI) system when the component is created. 
* checks if the user is already logged in by checking authenticationService.currentUserValue and redirects to the home page if they are.


The ngOnInit() method:

* is an Angular lifecycle hook that runs once after the component is created. 
* Creates a new FormGroup by calling this.formBuilder.group() and assigns it to the this.loginForm property. The parameters passed to the FormBuilder tell it to create two form controls - username and password, the form controls are both initialised with empty strings ('') as values and set to required with the Validators.required Angular validator.
* sets the this.returnUrl property to the value passed in the url querystring, or defaults to the home page ('/') if there isn't a value in the querystring. The return url property allows you to redirect the user back to the original page they requested before logging in.


The f() getter is a convenience property to enable shorthand access to the login form controls via this.f in the login component and f in the login component template that we'll create in the next step.


The onSubmit() method:

* sets the this.submitted property to true to indicate that an attempt has been made to submit the form, this property is used in the login component template to display validation errors only after the first submission has been attempted.
* checks if the form is valid by checking this.loginForm.invalid and prevents submission if it is invalid.
* sets the this.loading property to true before submitting the user credentials via the authentication service, this property is used in the login component template to display a loading spinner to the user and disable the login button.
* authenticates the user by calling the this.authenticationService.login() method with the username and password as parameters. The authentication service returns an Observable that we .subscribe() to for the results of the authentication. On success the user is redirected to the returnUrl by calling 
this.router.navigate([this.returnUrl]);. On fail the error message is stored in the this.error property to be displayed by the template and the this.loading property is reset back to false.
The call to .pipe(first()) unsubscribes from the observable immediately after the first value is emitted.