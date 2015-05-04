DrobBoxNodeJs
=======================
The goal for this week's assignment is to build a Dropbox Clone, which is a fancy way of saying a directory that exists in multiple locations that is kept in sync to be a perfect mirror. If a file is added to the server directory, it should get pushed to the client and appear in the client's directory.


Time spent:  12 hours spent in total

 User Stories: 
  Server: 
- [x] Setup an HTTP server listening on port 8000.
- [x] Implement an HTTP route for FILES for GET, HEAD, PUT, POST, DELETE
- [x] Implement an HTTP route for DIR for GET, HEAD, PUT, POST, DELETE
- [] (Optional) Use HTTPS by defulat, and redirect from HTTP 
- [x] CLI support added. (bode index.js --dir /some/root/dir)
- [x] Add TCP support. PUT, POST and DELETE update to connected clients is done using json. (json-socket used)
- [x] It watches for changes in the root folder and sends update to the clients using Chokidar.
- [] (optional) Create, delete or update files when the corresponding packets are received from clients
- [](optional) Add FTP support so that an FTP client can be used to access the files
 
  Client:
- [x] Use CWD as the root 
- [x] Connect to the server using TCP
- [x] Create, delete or update the contents of files when the corresponding packets are received from the server
- [] (optional) Watch the CWD for file changes with 
- [] (optional) Support conflict resolution
- [x] Add CLI 

