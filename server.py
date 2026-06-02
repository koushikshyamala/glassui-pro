from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app) # Allows your browser to talk to this server

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="koushik", # 
        database="glassui"
    )

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    hashed_password = generate_password_hash(password)

    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        sql = "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)"
        cursor.execute(sql, (username, email, hashed_password))
        db.commit()
        
        cursor.close()
        db.close()
        return jsonify({"status": "success", "message": "Account created successfully!"}), 200
        
    except mysql.connector.Error as err:
        if err.errno == 1062: 
            return jsonify({"status": "error", "message": "Email or Username already exists."}), 400
        return jsonify({"status": "error", "message": str(err)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True) 
        
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        cursor.close()
        db.close()

        if user and check_password_hash(user['password_hash'], password):
            return jsonify({
                "status": "success", 
                "message": "Login successful!",
                "user": {"id": user['id'], "username": user['username'], "email": user['email']}
            }), 200
        else:
            return jsonify({"status": "error", "message": "Invalid email or password."}), 401

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/save-design', methods=['POST'])
def save_design():
    data = request.json
    try:
        db = get_db_connection()
        cursor = db.cursor()

        # Notice we added user_id to the INSERT and an extra %s
        sql = """INSERT INTO designs 
                 (user_id, shape_type, bg_color, blur_val, opacity_val, generated_css) 
                 VALUES (%s, %s, %s, %s, %s, %s)"""

        values = (
            data.get('user_id', None), # Grabs the user ID if logged in, otherwise saves as NULL
            data['shape'], 
            data['bg_color'], 
            data['blur'], 
            data['opacity'], 
            data['css']
        )

        cursor.execute(sql, values)
        db.commit()
        cursor.close()
        db.close()

        return jsonify({"status": "success", "message": "Saved!"}), 200

    except Exception as e:
        print("Database Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Python Server running on http://localhost:5000")
    app.run(port=5000, debug=True)