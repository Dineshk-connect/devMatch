This document helps to understand the development flow from the scratch.

Day-1
    (Developmnet + learning )

Session -01

- Create a repository
- Initialize the repository(npm init)
- node_modules, package.json, package-lock.json
- Install Express
- Create a server
- Listen to port 3000
- Write request handlers for /tes, /hello
- Install nodemon and update scripts inside package.json

Session -02

- Initialize git (git init, git add . , git commit -m "message") //This is local repo 
- .gitignore (node_modules)
- Create a remote repo on github
- Push all code to remote origin
         commnads are-
         - git remote add origin https://github.com/Dineshk-connect/devMatch.git
         - git branch -M main
         - git push -u origin main
- Order of the routes matteer here.
- Install Postman App and make a workspace/collection > test API call

Day-2 

Session - 01

- Multiple route handlers
- next()
- next function and errors along with res,send()
- Middleware
- How express Js  handles the requests behind the scences
- Difference between app.use vs app.all
- Dummy Authentication middleware for Admin and user
- Error Handling using app.use("/", (err,req,res,next)={});

Session -02
 
- Create a free cluster on MongDB officila website (Mongo Atlas)
- Install mongoose library
- Connect your application to the Database "Connection-url"/devMatch
- Call connectDB function and connect to database before starting application on 3000
- Create a UserSchema and UserModel
- Create Post /signup API to add data to the database
- Push some documents using API calls from postman
- Error handling using try catch

Session -03

- Difference b/w JS object and JSON
- Add the express.json middleware to your app
- Make your API dynamic to recieve data from the end user
- API - Get user by email
- API - Feed API - GET/feed - get all the users from the database
- API - Update a user


Day -03

Session -01

- Explore schematype options from the documentation 
- add required, unique, lowercase, min, minLength, trim 
- Add default
- Create a custom validate function for gender
- Improve the DB Schema - PUT all the appropriate validations on each field in schema
- Add timestams to the userschema
- Add API level Validation on Patch request & signup post api
- Data Sanitizing - Add API validation for each field
- Install validator
- Explore validator library function and Use validator functions for password, email 



Day -04

Session -01

- validate data in signup API
- Install bcrypt package
- Create Passwordhash using bcrypt.hash 
- Create login API
- Compare passwords and throw errors if email and password are incorrect

Session -02

- Install cookie-parser
- Create GET /profile  API and check if you get the cookie back 
- Install jsonwebtoken
- In login API, after email and password validation, create a JWT Token and send it to user in 

Day -05

Session -01

- Read the cookies inside your profile API and find the logged in user
- UserAuth Middleware
- Add the userAuth middleware in Profile API and a new SendConnectionRequest API
- Set the exipry of JWT token and cookies to 7 days

- Create UserSchema method to getJWT()
- Create Userschema method to comparepassword(passwordInputByUser)

Session -02

- Explore tinder APIs
- Create a list of All APIs
- Group multiple Routes under respective Routers
- Read documnetation for express.Router()
- Create routes folder for managing auth, profile, request, routers
- Create authRouter, profileRouter, requestRouter
- Import these routers in app.js
- Create POST /logout API
- Create PATCH /profile/edit
- Create PATCH /profile/password API => forgot password API
- Validate all the data in every POST, PATCH APIs


Day -06

Session -01

- Create Coonection Request schema
- Send Connection Request API
- Proper Validation of Data 
- Think about all the corner cases
- $or query and $and query in moongose
- schema.pre("save) function
- Read more about indexes in MongoDB
- Why do we need index in DB
- Always think about corner Cases

Note: POST(/request/review/accepted/68e8f0bd089085b2ed43191b)
- In the above API the requestId should from the ConnectionRequests document which meana that If A sent a connectionRequest to B 
  then on unique Id will created in the schema , you should pass that ID


Day -07

Session -01

- Write code with proper validations for POST /request/review/:status/:requestId
- Read about ref and populate 
- Create GET /user/requests/recieved with all the checks

Session -02

- Logic for GET /feed API
- Explore the $nin, $and, $ne and other query opeartors
- pagination

- /feed?page=1&limit=10 => 1-10
- /feed?page=2&limit=10 => 11-20
- /feed?page=3&limit=10 => 21-30
