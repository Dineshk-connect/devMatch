# DEVMATCH APIs

## authRouter
- POST /signup
- POST /login
- POST /logout

## profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter
- POST /request/send/:status/:userId
- POST /request/review/:status/:userId


## userRouter
- GET /user/requests
- GET /connections
- GET /feed - Gets you the profiles of other users on platform

Status: ignore, intrested, aceepted, rejected
