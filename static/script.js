//Get the buttons, input field and yet to be sorted list
const inputField = document.getElementById("newEntity");
const addButton = document.getElementById("addButton");
const sortButton = document.getElementById("sortButton");
const list = document.getElementById("myUL");

/** 
 *refreshList function
 *
 *When text is inputted into search box it is turned to lowercase
 *It is then compared with the rest of the items in the list
 *If the search is present it displays all that match
 */

function refreshList()
{
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_list', true);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
        {
            const todo_list = JSON.parse(xhr.responseText);
            list.innerHTML = ""; // clear the existing list items

            for (let i = 0; i < todo_list.length; i++)
            {
                const item = todo_list[i];
                const listItem = document.createElement("li");
                listItem.setAttribute("data-id", item.id);
                listItem.setAttribute("data-priority", item.priority);
                listItem.appendChild(document.createTextNode(item.text));
                const prioritySpan = document.createElement("span");
                prioritySpan.classList.add("priority");
                prioritySpan.textContent = "(" + item.priority + ")";
                listItem.appendChild(prioritySpan);
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete");
                deleteButton.textContent = "Delete";
                deleteButton.dataset.itemId = item.id; // sets itemID as a data attribute 
                deleteButton.addEventListener("click", function(event)
                { // adds event listener to the delete button
                    event.preventDefault();

                    const itemId = deleteButton.dataset.itemId;

                    fetch(`/delete/${itemId}`,
                        {
                            method: "POST"
                        })
                        .then(response =>
                        {
                            if (response.ok)
                            {

                                listItem.parentNode.removeChild(listItem); //removes the item from the list from the DOM
                            }
                            else
                            {
                                console.log("Failed to delete")
                            }
                        })
                        .catch(error =>
                        {
                            console.error(error);
                            alert("An error occurred while deleting the item.");
                        });
                });
                listItem.appendChild(deleteButton);
                list.appendChild(listItem);
            }
        }
    };
    xhr.send();
}

/** 
 *code for the addButton function
 *Gets the new item from the text box and priority from raido buttons
 *Clears the input field and sends request to server to add the item
 */


// When the addButton is clicked add an event listener
addButton.addEventListener('click', function(e)
{
    e.preventDefault();

    // Gets the inputField text and the priority value
    const newItem = inputField.value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    inputField.value = "";

    // Sends an AJAX request to server to add the new item to the list
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/add', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
        {
            console.log(xhr.responseText);
            refreshList();
        }
    };
    xhr.send("item=" + newItem + "&priority=" + priority);
});


// Add the priority values to the pre-exsiting list items
const existingListItems = document.querySelectorAll("#myUL li");
for (let i = 0; i < existingListItems.length; i++)
{
    const listItem = existingListItems[i];
    if (!listItem.hasAttribute("data-priority"))
    {
        listItem.setAttribute("data-priority", "low");
    }
}


/** 
 *sortButton functionality
 *
 *Converts the list into an array, then sorts based on priority
 *Rmoves all items and replaces with the sorted list
 */


// Adds an event listener to the sort button when clicked
sortButton.addEventListener('click', function(e)
{
    const allListItems = list.querySelectorAll("li"); // Get all list items

    const itemsArray = Array.prototype.slice.call(allListItems); // Convert the list into an array for sorting

    // Sort the array based on data priority
    itemsArray.sort(function(a, b)
    {
        var aPriority = a.getAttribute("data-priority");
        var bPriority = b.getAttribute("data-priority");
        if (aPriority < bPriority)
        {
            return -1;
        }
        else if (aPriority > bPriority)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    });

    // Removes all items from the unordered list
    while (list.firstChild)
    {
        list.removeChild(list.firstChild);
    }

    // Adds the sorted items back to the unordered list
    for (var i = 0; i < itemsArray.length; i++)
    {
        list.appendChild(itemsArray[i]);
    }
});


/** 
 *searchBar code 
 *
 *When text is inputted into search box it is turned to lowercase
 *It is then compared with the rest of the items in the list
 *If the search is present it displays all that match
 */


// Adds an eventlistener to the search bar for an input event
const searchBar = document.getElementById("searchBar");
searchBar.addEventListener("input", function()
{
    const searchQuery = searchBar.value.toLowerCase();
    const listItems = list.getElementsByTagName("li");

    for (let i = 0; i < listItems.length; i++)
    {
        const listItem = listItems[i];
        const text = listItem.textContent.toLowerCase();

        if (text.includes(searchQuery))
        {
            listItem.style.display = "block";
        }
        else
        {
            listItem.style.display = "none";
        }
    }
});


/** 
 *priorityButtons code 
 *
 *For each of the buttons clicked the matching items are displayed
 */


// Adds event listeners to priority buttons for click event
const priorityButtons = document.querySelectorAll(".priority-button");

priorityButtons.forEach((button) =>
{
    button.addEventListener("click", function()
    {
        const isSelected = button.classList.contains("selected");

        if (isSelected)
        {
            button.classList.remove("selected");
        }
        else
        {
            button.classList.add("selected");
        }
        updateListItems();
    });
});

// Helper function to update list items based on selected priorities
function updateListItems()
{
    const selectedPriorities = Array.from(priorityButtons)
        .filter((button) => button.classList.contains("selected"))
        .map((button) => button.dataset.priority);

    const listItems = list.getElementsByTagName("li");

    for (let i = 0; i < listItems.length; i++)
    {
        const listItem = listItems[i];
        const itemPriority = listItem.getAttribute("data-priority");

        if (selectedPriorities.length === 0 || selectedPriorities.includes(itemPriority))
        {
            listItem.style.display = "block";
        }
        else
        {
            listItem.style.display = "none";
        }
    }
}

// Initialize the list on page load
refreshList();