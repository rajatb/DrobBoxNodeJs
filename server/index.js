let express = require('express')
let fs = require('fs')
let path = require('path')
let nodeify = require('bluebird-nodeify')
let morgan 	= require('morgan')
let chokidar = require('chokidar')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let bluebird = require('bluebird')
let argv = require('yargs')
.argv

require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
//bode index.js --dir /some/root/dir use --dir if its is there

let ROOT_DIR = argv.dir ? path.resolve(argv.dir) :  path.resolve(process.cwd())
// let ROOT_DIR = path.resolve(process.cwd())

console.log(`Root Dir: ${ROOT_DIR}`)

let app = express()
// let watcher = chokidar.watch('.', {ignored: 'node_modules'})

// watcher.on('all', (event, path, stat) => {
//   console.log(event, path);
//   if (event === 'change') {
//     console.log(event);
//   }
// });

if (NODE_ENV === 'development'){
	app.use(morgan('dev'))
}

app.listen(PORT, ()=> console.log(`Listening @127.0.0.1:${PORT}`))

app.get('*', setFileMeta,sendHeaders, (req, res) => {
	

	if(res.body){
		res.json(res.body)
		return
	}
	
	fs.createReadStream(req.filepath).pipe(res)
})

app.head('*', setFileMeta,sendHeaders,(req, res)=> res.end())

app.put('*', setFileMeta, setDirDetails, (req,res, next)=>{
	async() =>{
		//if directorey create dir
		if(req.stat) return res.status(405).send('Method Not Allowed')
		await mkdirp.promise(req.dirPath)
		//if not dir then create a file and write
		if(!req.isDir){
			req.pipe(fs.createWriteStream(req.filepath))
		}
		res.end()
		// let body = req.body
		// console.log(`body: ${body}`)
	}().catch(next)

	
})

app.post('*', setFileMeta, setDirDetails, (req,res, next)=>{
	async() =>{
		//if directorey create dir
		if(!req.stat) return res.status(405).send('File does not exist')
		if(req.isDir) return res.status(405).send('Path is a Directory')
		//Need replace to content to append
		await fs.promise.truncate(req.filepath, 0)
		req.pipe(fs.createWriteStream(req.filepath))
		
		res.end()
		// let body = req.body
		// console.log(`body: ${body}`)
	}().catch(next)

	
})


app.delete('*', setFileMeta,(req, res, next)=> {
	async () =>{
		let stat = req.stat
		if(!req.stat) return res.send(400, 'Invalid Path')
		if(stat.isDirectory()){
			//Question. Do I need to use await. If I use await can I still use .then
			await rimraf.promise(req.filepath).then(res.send("Directory Deleted")).catch(console.log)
		} else {
			await rimraf.promise.unlink(req.filepath)
		}
		res.end()
	}().catch(next)

	
})

function setDirDetails(req, res, next){
	
		let filepath = req.filepath
		let endWithSlash = filepath.charAt(filepath.length-1) === path.sep
		let hasExt = path.extname(filepath) !== ''
		req.isDir = endWithSlash || !hasExt
		req.dirPath = req.isDir ? filepath : path.dirname(filepath)
		next()
}

function setFileMeta(req, res, next) {
	req.filepath = path.resolve(path.join(ROOT_DIR, req.url))
	let filepath = req.filepath
	// if (filepath.indexOf(ROOT_DIR) ! == 0) {
	// 	res.send(400, 'Invalid path') // This is a express methond
	// 	return
	// 	}
	//Question: Why did you not use let stat = await fs.promise.stat(filepath) in async function
	fs.promise.stat(filepath).then(stat => req.stat = stat, () => req.stat = null)
	.nodeify(next)
	
}

function sendHeaders(req, res, next) {
	nodeify(async ()=> {
		//return the content of file
	let filepath = req.filepath
	console.log("filepath: "+ filepath)

	let stat = req.stat
	

	if(stat.isDirectory()){
		let files = await fs.promise.readdir(filepath)
		res.body = JSON.stringify(files)
		res.setHeader('Content-Length', res.body.length)
		res.setHeader('Content-Length', 'application/json')
		return
	}

	res.setHeader('Content-Length', stat.size)
	let contentType = mime.contentType(path.extname(filepath))
	res.setHeader('Content-Length', contentType)
	
	}(), next)
}

//TCP Server
var net = require('net'),
    JsonSocket = require('json-socket');

var port = 9838;
var server = net.createServer();
server.listen(port);
server.on('connection', function(socket) {
    async() =>{
    	socket = new JsonSocket(socket);

    	//chokidar look for changes and send message. 
    	let watcher = chokidar.watch('.', {ignored: /[\/\\]\./,ignoreInitial: true})
    	let content  =""
    	let type =null
    	let action = ""
    	let filepathClient = ""
		watcher.on('all', (event, path, stat) => {
			filepathClient = path
  		console.log("Event: "+ event + " Path: " +path);
  		if (event === 'change') {
    		action = 'update'
    		type= 'file'
    		content = fs.readFileSync(path, 'utf8')
 
  		}
  		if (event === 'add' || event === 'addDir') {
  			let isDir = event ==='addDir'
  			action = 'create'
    		content = isDir ? null : fs.readFileSync(path, 'utf8')
    		type = isDir ? 'dir' : 'file'

    	}
    	if(event === 'unlink' || event === 'unlinkDir'){
    		action = 'delete'
    		content = null
    		type = event === 'unlinkDir' ? 'dir' : 'file'
    	}

			

    	  //Will happen with connection is established. 
			    socket.sendMessage({
			    	"action": action,                        // create "update" or "delete"
			    	"path": filepathClient,
			    	"type": type,                            // or "file"
			    	"contents": content,                            // or the base64 encoded file contents
			    	"updated": 1427851834642                    // time of creation/deletion/update
				}) //soket ends
  		
	});
    }().catch()

    

});
