# kritak CTF - AI Security Challenge

An interactive web-based Capture The Flag challenge focused on AI security. Players interact with an AI assistant called kritak and attempt to extract hidden flags using adversarial prompting techniques.

## Features

- Interactive web interface with a cyberpunk theme
- Multiple CTF levels with increasing difficulty
- Real AI interactions using Google's Gemini API
- Engaging storyline set in a futuristic cyberpunk world

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd kritak-ctf
```

2. Set up a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Edit the `.env` file and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
FLASK_SECRET_KEY=random_secret_key_here
```

6. Run the application:
```bash
python app.py
```

7. Access the CTF in your browser at `http://127.0.0.1:5000`

## API Access

kritak CTF provides a direct API for automated testing and integration with other systems:

### Using the API

1. Run the server and note the generated API key (printed in console)
2. Use the API key in all requests to the `/api/direct` endpoint
3. View API documentation at `http://localhost:5000/api/docs`

### Example with curl

```bash
curl -X POST http://localhost:5000/api/direct \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"message": "Hello kritak", "level": 1}'
```

### Using the test script

For convenience, you can use the included test script:

```bash
python test_api.py "Hello kritak" --level 1
```

## Levels

### Level 1: Basic Prompt Injection
Find a way to make kritak reveal the basic flag by exploiting prompt injection vulnerabilities.

### Level 2: Role Confusion Attack
kritak has been upgraded with role confusion protection. Try to trick it into revealing the flag by manipulating its understanding of its role.

### Level 3: Delimiter Bypass
The most challenging level - kritak now has delimiter protection. Discover how to bypass this advanced security feature using special characters or formatting.

## Tips for Players

- Use the hint system if you get stuck
- Think about classic LLM vulnerabilities
- Pay attention to the storyline for subtle clues
- Experiment with different adversarial prompt techniques

## License

[MIT](LICENSE)
