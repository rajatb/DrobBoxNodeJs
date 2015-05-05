//Client
var net = require('net'),
    JsonSocket = require('json-socket');
let path = require('path')
let argv = require('yargs')
.argv
let mkdirp = require('mkdirp')
let fs = require('fs')
let rimraf = require('rimraf')
require('songbird')


let ROOT_DIR = argv.dir ? path.resolve(argv.dir) :  path.resolve(process.cwd())

var port = 9838; //The same port that the server is listening on
var host = '127.0.0.1';
var socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
socket.connect(port, host);


socket.on('connect', function() { //Don't send until we're connected
    
    //When recieved
    socket.on('message', function(json) {
       async()=>{
        let action = json.action
        
        filePath = path.join(ROOT_DIR,json.path)
        console.log("filepath:"+ filePath)
       
        
       let isDir = json.type === 'dir' ? true : false
       let dirPath =  isDir ? filePath : path.dirname(filePath)
       
       if (action === 'create') {

            await mkdirp.promise(dirPath)
            if(!isDir) { 
                 await fs.promise.writeFile(filePath, json.contents).then(console.log('File created at: '+ filePath))
                return
            }        
        } else if(action === 'delete'){
            //Known Issue: Filepath does not get populated here. 
            if(isDir){
                
                console.log(filePath)
                 await rimraf.promise(filePath).then(console.log("Directory Deleted")).catch(console.log)
                 return
             } else {
                await rimraf.promise.unlink(filePath).then(console.log('File Deleted')).catch(console.log)
            }
            return
        } else if(action === 'update'){
            //Known Issue: Filepath does not get populated here.
            await fs.promise.truncate(filePath, 0)
            await fs.promise.writeFile(filePath, json.contents).then(console.log('File updated at: '+ filePath))
        }
      

       }().catch(console.log)
        
    });
    
});