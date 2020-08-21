Udacity Capstone project for Front End Web Developement Nanodegree (FEND)

Project asks for a single page website which receives a user-input location and date and displays information pertinent to making a trip, including weather patterns, pictures, and another designer-chosen element. I have chosen to include:
1- a user-input do-do/to-bring list
2- multiple trips logged on the page by dates
3- browser memory for later followup
4- user can update list or "refresh" weather for trip

Approach:
1- Set up folder structure and files from scratch
2- Initialize GIT, Node with express, and webpack
3- Install plugins and filters
4- Form HTML and SCSS
5- Form server.js and client js for basic communications
6- Obtain and test API from the three desired sources
7- Parse API data and propagate user feed
8- Refine code through build tools
9- Test and initialize service workers

Logic of the Javascript:
-Two JS files. One for obtaining user input for Trip, creating and saving Trip data to server and localstorage. The second for building the Trips on the page and refreshing/resaving trip info.
-Flow of callAPI js:
  -Declare Objects for temporary data storage so that the app can analyze and store trip information
  -Listen for location request. Pass it through a validator
  -Send validated request to Geonames and return list of location options for user to choose from
  -Send chosen location's lat/lon location to Weatherbit. Return 16 day forecast
  -listen for user's date range for trip
  -Compare user's date of trip with 16 day forecast to obtain the range, average, and mean of temperature, humidity, and precipitation chances for that trip.
  -Listen for user to add trip to-do list and Trip name (assign default name if user doesn't add one)
  -Call pixabay API with the trip location keyword. JS creates a DATAURL string of the pixabay url and logs the picture to the server.
  -Store all the Trip information in the browser's localStorage.
-Flow of updatePage js:
  -Upon page load, find existing Trips in the localStorage and build them
  -Listen for user changes to each trip
  -Add some flair to the trip building process
-Flow of server js:
  -require addons
  -use addons and get port up and running
  -listen for call to geoname. fetch data from geoname API and return to browser
  -listen for call to weatherbit. fetch data and return to browser
  -listen for call to pixabay. search pixabay API for location keyword. Prioritize "vacation" category. If pixabay returns no images for that search, then research with a default 'vacation' search.
  -analyze the picture data. Run a randomizer for the top 3 results and return a single image. See if the picture ID exists in server memory object. If the picture is not stored in server, then send the picture data to browser api to build DATAURL. The browser returns the DATAURL as a string and server logs it with the picture ID.
  -Listen for browser call to the server object containing the picture dataurl. Return picture data for browser to build.

  Note: The reason I chose to create and log dataurl of the pixabay photo is because Pixabay's API protocol requires that any images that are used in the client browser not use pixabay's cdn. They require that the API owner download the image to their own servers to use. While I could certainly get around that by adding the 'preview' url into the DOM, I felt it was in best practice with the rules to honor that request. In another setting, I would pursue what is needed to actually download the higher-resolution image to a server's image file location instead of depend on internal server objects which can lose data. 
