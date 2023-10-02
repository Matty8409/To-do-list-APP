from flask import Flask, request, jsonify, render_template, redirect, url_for
import json, os

app = Flask(__name__)

# Load the initial to-do list items from the JSON file
with open("data.json", "r") as f:
    todo_list = json.load(f)['items']

@app.route('/')
def base_page():
    return render_template('index.html', todo_list=todo_list)


@app.route('/add', methods=['POST'])
def add_item():
    # Extract the new item from the request data
    item = {
        'id': len(todo_list) + 1,
        'text': request.form['item'],
        'priority': request.form['priority']
    }

    # Add the new item to the to-do list
    todo_list.append(item)

    # Write the updated to-do list back to the JSON file
    with open("data.json", "w") as f:
        json.dump({'items': todo_list}, f)

    # Redirect back to the homepage
    return redirect(url_for('base_page'))


@app.route('/delete/<int:item_id>', methods=['POST'])
def delete_item(item_id):
    global todo_list
    print(f"Deleting item with ID {item_id}...")
    
    # Search for the item with the given item id in the to do list
    for i in range(len(todo_list)):
        if todo_list[i]['id'] == item_id:
            # Remove the item from the todo_list
            del todo_list[i]
            # Write the updated todo_list back to the JSON file
            with open("data.json", "w") as f:
                json.dump({'items': todo_list}, f)
            # Return a success response
            return jsonify({'success': True})
    
    # If no item was found with that id trow an error
    return jsonify({'success': False, 'error': 'Item not found'})
  
@app.route("/api/journal", methods=['PUT'])
def upload():
    print('saving Journal')
    messageOK = jsonify(message="Journals uploaded!")
    messageFail = jsonify(
        message="Uploading Journals failed as dats not in JSON format!")
    if request.is_json:
        # Parse the JSON into a Python dictionary
        req = request.get_json()
        # Print the dictionary
        print(req)
        #save json to file
        # file_name = "data/journal_test.json"
        site_root = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(site_root, "data", "data.json")

        # with keyword deals with closing file etc.
        with open(json_url, 'w') as openfile:
            json.dump(req, openfile)

        # Return a string along with an HTTP status code
        return messageOK, 200

    else:

        # The request body wasn't JSON so return a 400 HTTP status code
        return messageFail, 400


@app.route('/get_list')
def get_list():
    return jsonify(todo_list)


@app.after_request
def add_header(response):
    response.cache_control.max_age = 0
    return response

if __name__ == '__main__':
    app.run('0.0.0.0', 3003)
