let form = document.querySelector("form");
let anchor = document.querySelector("a");
let icon = document.querySelector("i");
function send_data(e)
{
	e.preventDefault();
	if (form.todo.value.length > 100)
		return alert("number of charachters must be less then 100");
	fetch('/submit', 
		{
			headers: {
				'Content-Type': 'application/json'
			},
			method:"POST",
			body:JSON.stringify(
			{
				todo:form.todo.value
			})
		})
	.then((res) => res.json())
	.then((res)=> 
		{
			if (res.error)
				 console.log(res.error);
			else
			{
				container.innerText = "";
				get_todos();
			}
		});
	console.log(e);
	console.log("server says hi!!!");
}

function delete_data(e)
{
	let container = document.querySelector("#container");
	let id = e.target.getAttribute("data-id");

	fetch("/delete?id=" + id, 
		{
			method:"DELETE"
		})
	.then((res) => res.json())
	.then((res) =>
		{
			console.log("get response");
			if (res.error)
				console.error(res.error);
			else
			{
				container.innerText = "";
				get_todos();	
			}
		});
}

function create_todo_div(todo)
{
	let div = document.createElement("div");
	let text = document.createTextNode(todo.task);
	let trash_icon = document.createElement("i");

	div.className = "task";
	trash_icon.className = "fas fa-trash-alt text-center";
	trash_icon.setAttribute("data-id", todo.rowid);
	trash_icon.addEventListener("click", delete_data);
	div.appendChild(trash_icon);
	div.appendChild(text);
	return div;
}

function show_todos(todos_arr)
{
	let container = document.querySelector("#container");
	let tmp;
	todos_arr.forEach((todo) => 
		{
			tmp = create_todo_div(todo);
			container.appendChild(tmp);
		});
}

function get_todos()
{
	fetch("/todos")
	.then((data) => data.json())
	.then((data) => show_todos(data));
}

anchor.addEventListener("click", delete_data);
form.addEventListener("submit", send_data);
icon.addEventListener("click", ()=>console.log("trash clicked"));
window.onload = get_todos
