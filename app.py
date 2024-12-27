from flask import Flask, jsonify, request
import os

port = os.environ.get('PORT')

app = Flask(__name__)

# Sample in-memory data store
data = {
    "1": {"name": "John Doe", "age": 30},
    "2": {"name": "Jane Doe", "age": 25}
}

# GET /
@app.route("/", methods=["GET"])
def index():
    return "Welcome to the Flask app!"

# GET /users
@app.route("/users", methods=["GET"])
def get_users():
    return jsonify(list(data.values()))

# GET /users/:id
@app.route("/users/<id>", methods=["GET"])
def get_user(id):
    return jsonify(data.get(id, {"error": "User not found"}))

# POST /users
@app.route("/users", methods=["POST"])
def create_user():
    new_user = request.json
    new_id = str(len(data) + 1)
    data[new_id] = new_user
    return jsonify(new_user), 201

# PUT /users/:id
@app.route("/users/<id>", methods=["PUT"])
def update_user(id):
    updated_user = request.json
    if id in data:
        data[id] = updated_user
        return jsonify(updated_user)
    return jsonify({"error": "User not found"}), 404

# DELETE /users/:id
@app.route("/users/<id>", methods=["DELETE"])
def delete_user(id):
    if id in data:
        del data[id]
        return jsonify({"message": "User deleted"})
    return jsonify({"error": "User not found"}), 404

if __name__ == "__main__":
    app.run(debug=True,port=port)
