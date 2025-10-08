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
- POST /request/send/intrested/:userId
- POST /request/send/ignored/:
- POST /request/review/accepted/:userId
- POST /request/review/rejected/:userId

## userRouter
- GET /connections
- GET /requests/recieved
- GET /feed - Gets you the profiles of other users on platform

Status: ignore, intrested, aceepted, rejected
