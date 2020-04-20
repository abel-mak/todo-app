let anchor = document.querySelector("a");

function delete_data(e)
{
	e.preventDefault();
	fetch(this.getAttribute("href"), 
		{
			method:"DELETE"
		});
	console.log(this.getAttribute("href"));
}

anchor.addEventListener("click", delete_data);
