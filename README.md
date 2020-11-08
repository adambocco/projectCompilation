# API Mashup Project
For this assignment, you will create a single page *API Mashup* application which utilizes mutliple web APIs to create something useful for its users. 

## Background
An API mashup is a web application which consumes and/or manipulates data from multiple web APIs and presents this information in some useful way to the user.

From [Wikipedia](https://en.wikipedia.org/wiki/Mashup_(web_application_hybrid)):

> A mashup (computer industry jargon), in web development, is a web page or web application that uses content from more than one source to create a single new service displayed in a single graphical interface. (A mashup (computer industry jargon), in web development, is a web page or web application that uses content from more than one source to create a single new service displayed in a single graphical interface.

Utlizing existing APIs allows for developers to create applications faster and allows for creative solutions that otherwise might not have been possible.

## Instructions
Create a single page *API Mashup* application which consumes two or more APIs and uses this information to provide a valuable experience for its users.

Your application should create something more than the "sum of its parts" and 
provide a cohesive and new experience. The application should not simply consume a source of data (i.e. recent news stories), and present it as consumed to the user.

To begin, first complete and submit the *project proposal*. After approval, you may begin the *project implementation*.

### Project Proposal
Your project proposal should be written in *markdown* and placed in a `proposal` folder at the root of your project. It should have the following sections ...
1. Overview - one paragraph briefly summarizing what you plan to build
2. Application Description - write a couple of paragraphs describing what your application will do and what types of APIs you will use. Please provide enough detail so the reader understands what you are planning to build.
3. Web APIs - list the APIs (at least two) that you will be using in your project. Provide the name, URL, and what service it provides.
4. Mockup - As in the last project, provide a mockup of the single page in your application. Color choices are not necessary to specify ... only the mockup.

### Implementation Requirements
Your application should meet all the following requirements ...
1. Utilize Bootstrap for styling.
2. Consume two or more APIs.
3. JavaScript must be organized into modules. You shouldn't have one file with all of your code in it.
4. Utilize *axios* as a client to consume the APIs.
5. Application must provided all content "dynamically" - after user has landed on your site, you should not reload the page. All requests to your APIs should be asynchronous, and all page updates should be made through the DOM in JavaScript.

## Technical Notes & Tips
### Webpack & Project Structure
You may use webpack for this project (assumed in this template), however, if you are having issues installing the LTS version of Node, you may want to forgo Webpack for now. If you decide to go this route make sure your project stucture roughly mirrors the default included.

Of special importance is the `public` directory. Our goal here is to have only those files that should be served by the web server (the public files). This includes css, javascript, images and html files. We don't want site visitors to be able to see all of our "non-application" files, like `package.json`, etc.

IF you do use the webpack config included here, you need to install the node modules before you get started. Run the following from within your project folder.

```bash
npm install
```

To build the file you can do one of ...
```bash
npm run build
```
To build automatically when a file in `src` changes, run the following instead ...
```bash
npm run watch
```
I have already included *axios*  as well as *bootstrap* releated libraries in your npm requirements (`package.json`).

### API Selection
Utilize the [ProgrammableWeb API directory](https://www.programmableweb.com/apis/directory) to search for ideas and APIs to use.

## Project Submission
All your work must be pushed to this repository. The project proosal should be submitted first, and after approval, the implemenation should follow. Please see deadlines posted in Blackboard for due dates.

After you submit your project on GitHub, email me at clarkm1@southernct.edu and notify me that you submitted the proposal or implementation for grading.



