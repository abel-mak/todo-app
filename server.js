let http = require("http");
let port = 8081;
let fs = require("fs");
let root = "www";
let {parse} = require("querystring")
let sqlite = require("sqlite3").verbose();

function router(path, res)
{
	//path = (path == "/") ? "/form.html" : path;
	if (path == "/")
	{
		res.statusCode = 302;
		res.setHeader('Location','/form.html');
	}
	else
	{
		res.setHeader("Content-Type", "text/html");
		fs.readFile(root + path, "utf8", (err, file) =>
			{
				if (err)
					res.write("<h1>not found</h1>");
				else
					res.write(file);
				res.end();
			})
	}
}
function insert(data)
{
	let db = new sqlite.Database("d.db");
	
	console.log("from insert data.todo: ", data.todo);
	return new Promise((resolve, reject) =>
		{
			if (data.todo != "")
			{
				db.run("INSERT INTO todos(task) VALUES(?)", [data.todo], function(err) {
					if (err) 
						return reject(err);
					// get the last insert id
					resolve();
					console.log("A row has been inserted with rowid " + JSON.stringify(this));
				});
			}
			db.close();
		});
}

function dlt_row(table_name, condition)
{
	let db = new sqlite.Database("d.db");

	console.log("from dlt_row and condition: ", condition);
	return new Promise((resolve, reject) => 
		{
			db.run(`DELETE FROM ${table_name} WHERE ${condition}`, [], function (err)
				{
					if (err)
						return reject(err);
					resolve();
				});
			db.close();
		});
}


function get_todos()
{
	let db = new sqlite.Database("d.db");

	return new Promise((resolve, reject) => 
		{
			db.all("SELECT rowid,task FROM todos", [], (err, rows) => 
				{
					if (err)
						return reject(err);
					//return console.log("err from send_todos: " + err);
					resolve(rows);
				});
			db.close();
		})
}

function send_todos(res)
{
	res.setHeader("Content-Type", "application/json");
	get_todos()
		.then(todos => 
			{
				res.write(JSON.stringify(todos));
				res.end();	
			})
			.catch(err => console.log("err from get_todos: " + err));
}

function process_url(url)
{
	let i = 0;
	let path = "";
	let query = "";

	//get path, query begin after '?'
	while (i < url.length && url[i] != '?')
	{
		path += url[i];
		i++;
	}
	if (i == url.length)
		return [path, null];
	else
		while (++i < url.length)
			query += url[i];
	return [path, parse(query)];
}

let server = http.createServer((req, res) => 
	{
		let [path, query] = process_url(req.url);

		if (req.method == "GET")
		{
			if (path == "/todos")
				send_todos(res);
			else
			{
				router(req.url, res);
				res.write("/*try access: " + req.url + "*/" + "\n");
			}
		}
		else if (req.method == "POST")
		{
			let data = "";
			req.on("data", (chunck) =>
				{
					//data = JSON.parse(data.toString());
					data += chunck;
					//console.log(data.todo);
				});
			req.on("end", () => 
				{
					//data = Buffer.concat(data);
					data = JSON.parse(data.toString());
					insert(data)
					.then(() => 
						{
							res.write(JSON.stringify({error:null}))
							res.end();
						})
					.catch(err => 
						{
							res.write(JSON.stringify({error: "problem while inserting data"}))
							console.log("err from post method: " + err.message)
							res.end();
						});
					
				});
		}
		else if (req.method == "DELETE")
		{
			//to delete a task should send correspanding id for task
			res.setHeader("Content-Type", "application/json");
			dlt_row("todos", "rowid=" + query.id)
				.then(() => 
					{
						console.log("row deleted successfuly");
						res.write(JSON.stringify({error:null}))
						res.end();
					})
					.catch((err) => 
						{
							console.log("err from dlt_row" + err.message);
							res.write(JSON.stringify({error:"server may faced problems treating the request"}));
							res.end();
						});
			console.log("delete method and rowid: " + query.id);
		}
		//	console.log(req.method);
		console.log(req.method + ": " + JSON.stringify(process_url(req.url)));
	});

server.listen(port, ()=>
	{
		console.log("listening on port: " + port);
	});
