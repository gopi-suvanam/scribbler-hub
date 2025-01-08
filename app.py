from flask import Flask, render_template
import requests
import traceback

app = Flask(__name__)

GITHUB_API_URL = "https://api.github.com/repos"

def fetch_top_level_structure(user_name, repo):
    """Fetch the top-level structure of a GitHub repository and organize it as {directory_name: [files]}."""
    url = f"{GITHUB_API_URL}/{user_name}/{repo}/contents"
    print(url)
    response = requests.get(url)

    if response.status_code != 200:
        return None

    contents = response.json()
    directory_structure = {}

    for item in contents:
        if item["type"] == "file" and item["name"].endswith(".jsnb"):
            directory_structure.setdefault("root", []).append(item["name"])
        elif item["type"] == "dir":
            # Add the directory name as a key, fetch all files under the directory
            directory_structure[item["name"]] = []

    for directory in list(directory_structure.keys()):
        if directory != "root":
            dir_url = f"{GITHUB_API_URL}/{user_name}/{repo}/contents/{directory}"
            dir_response = requests.get(dir_url)
            if dir_response.status_code == 200:
                dir_contents = dir_response.json()
                for file in dir_contents:
                    if file["type"] == "file" and file["name"].endswith(".jsnb"):
                        directory_structure[directory].append(file["name"])
    return directory_structure

@app.route("/<user_name>/<repo>", methods=["GET"])
def list_jsnb_files(user_name, repo):
    try:
        # Fetch the top-level structure of the repository
        directory_structure = fetch_top_level_structure(user_name, repo)

        if directory_structure is None:
            return render_template("error.html", message="Failed to fetch repository contents or repository not found"), 404

        return render_template("list_notebooks.html", repo_path=f"{user_name}/{repo}", directories=directory_structure)

    except Exception as e:
        traceback.print_exc()
        print("Error")
        return render_template("error.html", message=str(e)), 500

if __name__ == "__main__":
    app.run(debug=True)
