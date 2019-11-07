# Motif Chrome Extension Development
The application is laid out in a simple directory structure that makes it easy to find templates, styles, and javascript files.

At the top level, you'll find two main directories: extension and server. As you might expect the extension code includes front end assets and source code organized in to assets and src directories respectively. In the server folder, you'll find JavaScript files organized by controllers, models, routes, and views.

The assets folder is meant to hold only the assets we need to keep the app running. Things like fonts and images go here.
The src folder is meant to hold source code files needed to run the application. External libraries and imports for the extension should go in the lib folder. All other code should go into main/app/* in either js, styles, or templates depending on whether or not they are JavaScript, CSS, or HTML files respectively.

Remember that all JavaScript files should be indented using two spaces and that git branches should be named according to the naming schemes outlined in our internal documentation.