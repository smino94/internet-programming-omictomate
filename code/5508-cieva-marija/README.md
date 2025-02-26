# Exam Repository

## Installing the dependencies

In order to start the application, you need to install the dependencies. To do this, run:

```bash
npm install
```

## Running the application

To start the application, run:

```bash
npm start
```

This will start two applications, one for the backend and one for the frontend. The backend will be available at `http://localhost:3000` and the frontend at `http://localhost:4200`. The frontend will automatically reload whenever you modify any of the source files. In this console you can also see the logs of the backend application and the frontend application.

Note that the console where the application is running is not interactive. E.g. if you want to use that console to generate a new component, you need to stop the application and start it again after you have generated the component. (Alternatively, you can use a new console to generate the component.)

To stop the application, you need to press `Ctrl+C` in the console where the application is running.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

If this command generates an error, that means that you need to install the Angular CLI. To do this, run:

```bash
npm install -g @angular/cli
```

Alternatively, you can use the following command to generate a new component:

```bash
npx ng generate component component-name
```