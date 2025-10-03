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





