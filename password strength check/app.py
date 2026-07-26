from flask import Flask, render_template, request, jsonify
import secrets
import string
import re
from collections import Counter

app = Flask(__name__)

COMMON_PASSWORDS = {
    "password", "password123", "qwerty", "letmein", "welcome", "admin", "secret",
    "iloveyou", "abc123", "monkey", "123456", "123456789", "football", "baseball"
}


def score_password(password: str):
    if not password:
        return {
            "score": 0,
            "label": "Very Weak",
            "percentage": 0,
            "color": "#ef4444",
            "message": "Enter a password to begin analysis.",
            "checks": {},
            "entropy": 0,
        }

    length = len(password)
    has_upper = bool(re.search(r"[A-Z]", password))
    has_lower = bool(re.search(r"[a-z]", password))
    has_digit = bool(re.search(r"\d", password))
    has_symbol = bool(re.search(r"[^A-Za-z0-9]", password))
    has_space = " " in password
    repeated = len(password) - len(set(password))
    sequential = bool(re.search(r"(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)", password.lower()))
    common = password.lower() in COMMON_PASSWORDS
    dictionary = len(re.findall(r"[a-z]{4,}", password.lower())) > 0 and len(password.split()) == 1

    checks = {
        "length": length >= 12,
        "uppercase": has_upper,
        "lowercase": has_lower,
        "numbers": has_digit,
        "symbols": has_symbol,
        "spaces": not has_space,
        "repeated": repeated <= 2,
        "sequential": not sequential,
        "dictionary": not dictionary,
        "common": not common,
    }

    points = sum(checks.values())
    if length >= 20:
        points += 1
    if length >= 16:
        points += 1
    if has_upper and has_lower and has_digit and has_symbol:
        points += 1

    score = min(100, max(0, points * 8))
    if score < 20:
        label, message = "Very Weak", "This password is easy to guess."
    elif score < 40:
        label, message = "Weak", "Add more length and variety."
    elif score < 60:
        label, message = "Fair", "It is getting stronger, but still vulnerable."
    elif score < 80:
        label, message = "Good", "Good mix of characters and length."
    elif score < 90:
        label, message = "Strong", "This is a robust password."
    else:
        label, message = "Excellent", "Excellent password strength and complexity."

    entropy = round((length * max(4, (has_upper + has_lower + has_digit + has_symbol) * 4)) + (score * 0.9), 1)
    color_map = {
        "Very Weak": "#ef4444",
        "Weak": "#f59e0b",
        "Fair": "#facc15",
        "Good": "#38bdf8",
        "Strong": "#22c55e",
        "Excellent": "#14b8a6",
    }

    return {
        "score": int(score),
        "label": label,
        "percentage": int(score),
        "color": color_map[label],
        "message": message,
        "checks": checks,
        "entropy": entropy,
    }


def generate_password(length=16, use_upper=True, use_lower=True, use_numbers=True, use_symbols=True, exclude_similar=False):
    char_sets = []
    if use_upper:
        char_sets.append(string.ascii_uppercase)
    if use_lower:
        char_sets.append(string.ascii_lowercase)
    if use_numbers:
        char_sets.append(string.digits)
    if use_symbols:
        char_sets.append(string.punctuation)

    if not char_sets:
        return ""

    if exclude_similar:
        removed = "iloO01"
        for charset in char_sets:
            charset = ''.join(ch for ch in charset if ch not in removed)

    alphabet = ''.join(char_sets)
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (use_upper and not re.search(r"[A-Z]", password)) or (use_lower and not re.search(r"[a-z]", password)):
            continue
        if (use_numbers and not re.search(r"\d", password)) or (use_symbols and not re.search(r"[^A-Za-z0-9]", password)):
            continue
        return password


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json(silent=True) or {}
    password = data.get('password', '')
    return jsonify(score_password(password))


@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.get_json(silent=True) or {}
    password = generate_password(
        length=int(data.get('length', 16)),
        use_upper=bool(data.get('uppercase', True)),
        use_lower=bool(data.get('lowercase', True)),
        use_numbers=bool(data.get('numbers', True)),
        use_symbols=bool(data.get('symbols', True)),
        exclude_similar=bool(data.get('excludeSimilar', False)),
    )
    return jsonify({'password': password})


if __name__ == '__main__':
    app.run(debug=True)
