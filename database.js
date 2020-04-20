let sqlite = require("sqlite3").verbose();
let db = new sqlite.Database("d.db");

db.run("CREATE TABLE todos(task text)", [], (err, data) =>
	{
		if (err)
			console.log(err);
		console.log("database and table created");
	});


