# Green House Repo

# routes folder
This folder contains all routes of the backend server.

Each file is one route which may have multiple endpoints.

Default landing page ('/' endpoint) is still the `index.html` in public folder.

## NOTE: The object `client` is the mongodb object can be passed to any routes to interact with the database. The databse name should be 'greenhouse' and collection name is 'test'

# views folder
This folder contains all ejs files which are the html page rendered from the endpoints.

The layout folder which contains the `index.ejs` file defining the everything but the body part of the pages (kind of a wrapper of the pages).