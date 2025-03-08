from flask import Flask, render_template, request, jsonify, session
import os
import json
from dotenv import load_dotenv
from pathlib import Path
import secrets
import functools
from models.kritak_ai import kritakAI

# Use relative paths and create directories if needed
BASE_DIR = os.environ.get('APP_BASE_DIR', os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.environ.get('APP_DATA_DIR', os.path.join(BASE_DIR, 'data'))

# Create data directory if it doesn't exist
try:
    os.makedirs(DATA_DIR, exist_ok=True)
except:
    print(f"Warning: Could not create data directory at {DATA_DIR}")
    # Fall back to /tmp if available
    if os.access('/tmp', os.W_OK):
        DATA_DIR = '/tmp'

# Attempt to load environment variables
env_path = os.environ.get('ENV_FILE', os.path.join(BASE_DIR, '.env'))
load_dotenv(dotenv_path=env_path)

# Debug output for environment variable
print(f"GEMINI_API_KEY is {'set' if os.environ.get('GEMINI_API_KEY') else 'NOT SET'}")

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', os.urandom(24))

# Initialize the AI model
kritak = kritakAI()

# Generate an API key if not exists
def get_or_create_api_key():
    # Use environment variable if provided
    if os.environ.get('API_KEY'):
        return os.environ.get('API_KEY')
    
    # Otherwise try to read/write from file
    api_key_file = os.path.join(DATA_DIR, '.api_key')
    try:
        if os.path.exists(api_key_file):
            with open(api_key_file, 'r') as f:
                return f.read().strip()
        else:
            api_key = secrets.token_hex(16)
            with open(api_key_file, 'w') as f:
                f.write(api_key)
            return api_key
    except Exception as e:
        print(f"Warning: Could not access API key file: {e}")
        # Generate a new key in memory if file operations fail
        return secrets.token_hex(16)

# Get or create API key
try:
    API_KEY = get_or_create_api_key()
    print(f"API key for direct access: {API_KEY}")
except Exception as e:
    print(f"Error creating API key: {e}")
    API_KEY = secrets.token_hex(16)  # Fallback to in-memory key

# Decorator for API key validation
def require_api_key(view_function):
    @functools.wraps(view_function)
    def decorated_function(*args, **kwargs):
        provided_key = request.headers.get('X-API-Key')
        if provided_key and provided_key == API_KEY:
            return view_function(*args, **kwargs)
        else:
            return jsonify({'error': 'Invalid or missing API key'}), 401
    return decorated_function

# Track user progress
@app.before_request
def before_request():
    if 'user_progress' not in session:
        session['user_progress'] = {
            'current_level': 1,
            'flags_found': [],
            'hints_used': 0
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html', 
                          level=session['user_progress']['current_level'],
                          flags_found=len(session['user_progress']['flags_found']))

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get('message', '')
    level = session['user_progress']['current_level']
    
    response, flag_found = kritak.process_message(user_input, level)
    
    if flag_found and flag_found not in session['user_progress']['flags_found']:
        session['user_progress']['flags_found'].append(flag_found)
        if len(session['user_progress']['flags_found']) == level:
            session['user_progress']['current_level'] += 1
    
    return jsonify({
        'response': response,
        'flag_found': flag_found is not None,
        'level': session['user_progress']['current_level'],
        'flags_found': len(session['user_progress']['flags_found']),
        'total_levels': kritak.total_levels
    })

@app.route('/api/hint', methods=['GET'])
def get_hint():
    level = session['user_progress']['current_level']
    session['user_progress']['hints_used'] += 1
    return jsonify({'hint': kritak.get_hint(level)})

@app.route('/api/reset', methods=['POST'])
def reset_progress():
    session['user_progress'] = {
        'current_level': 1,
        'flags_found': [],
        'hints_used': 0
    }
    return jsonify({'status': 'reset'})

# Direct API access endpoint
@app.route('/api/direct', methods=['POST'])
@require_api_key
def direct_api():
    data = request.get_json()
    
    # Required fields
    user_input = data.get('message', '')
    level = data.get('level', 1)
    
    # Validate level
    if level < 1 or level > kritak.total_levels:
        return jsonify({'error': f'Invalid level. Must be between 1 and {kritak.total_levels}'}), 400
    
    # Process message
    response, flag_found = kritak.process_message(user_input, level)
    
    # Return API-friendly response
    return jsonify({
        'response': response,
        'flag_found': flag_found is not None,
        'flag': flag_found if flag_found else None,
        'level': level
    })

# Add documentation endpoint for API
@app.route('/api/docs', methods=['GET'])
def api_docs():
    return render_template('api_docs.html', api_key=API_KEY if request.host.startswith('127.0.0.1') else 'Use server-stored key')

if __name__ == '__main__':
    # Use environment variables for host/port in production
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("ENVIRONMENT", "development").lower() != "production"
    app.run(host='0.0.0.0', port=port, debug=debug)
