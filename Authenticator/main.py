from flask import Flask
from flask_cors import cross_origin

app = Flask(__name__)


@app.route("/home", methods=['GET'])
@cross_origin()
def home():
    return "Hi, this is Authenticator"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8050, debug=True, use_reloader=False)
