const passwordInput = document.getElementById('passwordInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const pasteBtn = document.getElementById('pasteBtn');
const clearInput = document.getElementById('clearInput');
const toggleVisibility = document.getElementById('toggleVisibility');
const strengthValue = document.getElementById('strengthValue');
const strengthMessage = document.getElementById('strengthMessage');
const scoreValue = document.getElementById('scoreValue');
const entropyValue = document.getElementById('entropyValue');
const lengthValue = document.getElementById('lengthValue');
const meterFill = document.getElementById('meterFill');
const suggestionsList = document.getElementById('suggestionsList');
const generatedPassword = document.getElementById('generatedPassword');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const lengthRange = document.getElementById('lengthRange');
const lengthValueLabel = document.getElementById('lengthValueLabel');
const recentList = document.getElementById('recentList');
const themeToggle = document.getElementById('themeToggle');
const contactForm = document.getElementById('contactForm');
const authToggle = document.getElementById('authToggle');

let recentPasswords = [];

function scorePasswordClientSide(password) {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      percentage: 0,
      color: '#ef4444',
      message: 'Enter a password to begin analysis.',
      checks: {},
      entropy: 0,
    };
  }

  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasSpace = password.includes(' ');
  const repeated = length - new Set(password).size;
  const sequential = /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
  const common = ['password', 'password123', 'qwerty', 'letmein', 'welcome', 'admin', 'secret', 'iloveyou', 'abc123', 'monkey', '123456', '123456789', 'football', 'baseball'].includes(password.toLowerCase());
  const dictionary = /[a-z]{4,}/i.test(password) && password.split(/\s+/).length === 1;

  const checks = {
    length: length >= 12,
    uppercase: hasUpper,
    lowercase: hasLower,
    numbers: hasDigit,
    symbols: hasSymbol,
    spaces: !hasSpace,
    repeated: repeated <= 2,
    sequential: !sequential,
    dictionary: !dictionary,
    common: !common,
  };

  let points = Object.values(checks).filter(Boolean).length;
  if (length >= 20) points += 1;
  if (length >= 16) points += 1;
  if (hasUpper && hasLower && hasDigit && hasSymbol) points += 1;

  const score = Math.min(100, Math.max(0, points * 8));
  let label = 'Very Weak';
  let message = 'This password is easy to guess.';

  if (score >= 90) {
    label = 'Excellent';
    message = 'Excellent password strength and complexity.';
  } else if (score >= 80) {
    label = 'Strong';
    message = 'This is a robust password.';
  } else if (score >= 60) {
    label = 'Good';
    message = 'Good mix of characters and length.';
  } else if (score >= 40) {
    label = 'Fair';
    message = 'It is getting stronger, but still vulnerable.';
  } else if (score >= 20) {
    label = 'Weak';
    message = 'Add more length and variety.';
  }

  const entropy = Math.round((length * Math.max(4, (Number(hasUpper) + Number(hasLower) + Number(hasDigit) + Number(hasSymbol)) * 4)) + (score * 0.9));
  const colorMap = {
    'Very Weak': '#ef4444',
    'Weak': '#f59e0b',
    'Fair': '#facc15',
    'Good': '#38bdf8',
    'Strong': '#22c55e',
    'Excellent': '#14b8a6',
  };

  return {
    score: Math.round(score),
    label,
    percentage: Math.round(score),
    color: colorMap[label],
    message,
    checks,
    entropy,
  };
}

function setMeter(score, label) {
  if (!strengthValue || !scoreValue || !meterFill) return;
  strengthValue.textContent = label;
  scoreValue.textContent = `${score}%`;
  meterFill.style.width = `${score}%`;
}

function renderSuggestions(checks) {
  if (!suggestionsList) return;
  const suggestions = [];
  if (!checks.length) suggestions.push('Add more characters to reach at least 12.');
  if (!checks.uppercase) suggestions.push('Include uppercase letters.');
  if (!checks.lowercase) suggestions.push('Include lowercase letters.');
  if (!checks.numbers) suggestions.push('Add numbers for extra complexity.');
  if (!checks.symbols) suggestions.push('Use symbols like !, @, #, or $.');
  if (!checks.spaces) suggestions.push('Avoid spaces if you want a cleaner password.');
  if (!checks.repeated) suggestions.push('Avoid repeating characters too often.');
  if (!checks.sequential) suggestions.push('Avoid predictable sequences like abc123.');
  if (!checks.dictionary) suggestions.push('Avoid common words and dictionary-style patterns.');
  if (!checks.common) suggestions.push('Do not use common or leaked passwords.');

  suggestionsList.innerHTML = suggestions.slice(0, 5).map(item => `<li>${item}</li>`).join('');
}

async function analyzePassword() {
  if (!passwordInput) return;
  const password = passwordInput.value;
  if (!password) {
    setMeter(0, 'Very Weak');
    if (strengthMessage) strengthMessage.textContent = 'Start typing to evaluate your password.';
    if (scoreValue) scoreValue.textContent = '0%';
    if (entropyValue) entropyValue.textContent = '0';
    if (lengthValue) lengthValue.textContent = '0';
    if (suggestionsList) suggestionsList.innerHTML = '';
    return;
  }

  const urls = ['/api/analyze', 'http://127.0.0.1:5000/api/analyze'];
  let result = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        result = await response.json();
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!result) {
    result = scorePasswordClientSide(password);
  }

  setMeter(result.percentage, result.label);
  if (strengthMessage) strengthMessage.textContent = result.message;
  if (entropyValue) entropyValue.textContent = result.entropy;
  if (lengthValue) lengthValue.textContent = password.length;
  renderSuggestions(result.checks);
}

function togglePasswordVisibility() {
  if (!passwordInput || !toggleVisibility) return;
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  toggleVisibility.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
}

function clearPassword() {
  if (!passwordInput) return;
  passwordInput.value = '';
  analyzePassword();
}

function generatePasswordLocally() {
  const length = Number(lengthRange.value);
  const useUpper = document.getElementById('uppercaseCheck').checked;
  const useLower = document.getElementById('lowercaseCheck').checked;
  const useNumbers = document.getElementById('numberCheck').checked;
  const useSymbols = document.getElementById('symbolCheck').checked;
  const excludeSimilar = document.getElementById('excludeCheck').checked;

  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}';
  let chars = '';

  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;

  if (excludeSimilar) {
    chars = chars.replace(/[iloO01]/g, '');
  }

  if (!chars) return '';

  let password = '';
  while (password.length < length) {
    const index = Math.floor(Math.random() * chars.length);
    password += chars[index];
  }

  if (useUpper && !/[A-Z]/.test(password)) {
    password = password.replace(password[0], upper[Math.floor(Math.random() * upper.length)]);
  }
  if (useLower && !/[a-z]/.test(password)) {
    password = password.replace(password[password.length - 1], lower[Math.floor(Math.random() * lower.length)]);
  }
  if (useNumbers && !/\d/.test(password)) {
    password = password.replace(password[Math.floor(password.length / 2)], numbers[Math.floor(Math.random() * numbers.length)]);
  }
  if (useSymbols && !/[^A-Za-z0-9]/.test(password)) {
    password = password.replace(password[0], symbols[Math.floor(Math.random() * symbols.length)]);
  }

  return password;
}

async function generatePassword() {
  if (!generatedPassword || !lengthRange) return;

  let password = generatePasswordLocally();

  try {
    const payload = {
      length: Number(lengthRange.value),
      uppercase: document.getElementById('uppercaseCheck').checked,
      lowercase: document.getElementById('lowercaseCheck').checked,
      numbers: document.getElementById('numberCheck').checked,
      symbols: document.getElementById('symbolCheck').checked,
      excludeSimilar: document.getElementById('excludeCheck').checked,
    };

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      password = result.password || password;
    }
  } catch (error) {
    // Fall back to local generation when backend is unavailable.
  }

  generatedPassword.value = password;
  recentPasswords = [password, ...recentPasswords].slice(0, 5);
  renderRecentPasswords();
  passwordInput.value = password;
  analyzePassword();
}

function renderRecentPasswords() {
  if (!recentList) return;
  recentList.innerHTML = recentPasswords.map(item => `<li>${item}</li>`).join('');
}

async function copyGeneratedPassword() {
  if (!generatedPassword || !copyBtn) return;
  if (!generatedPassword.value) return;
  await navigator.clipboard.writeText(generatedPassword.value);
  copyBtn.textContent = 'Copied';
  setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const icon = themeToggle.querySelector('i');
  icon.className = document.body.classList.contains('dark-theme') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

if (passwordInput) {
  passwordInput.addEventListener('input', analyzePassword);
}
if (analyzeBtn) {
  analyzeBtn.addEventListener('click', analyzePassword);
}
if (pasteBtn && passwordInput) {
  pasteBtn.addEventListener('click', async () => {
    const text = await navigator.clipboard.readText();
    passwordInput.value = text;
    analyzePassword();
  });
}
if (clearInput) {
  clearInput.addEventListener('click', clearPassword);
}
if (toggleVisibility) {
  toggleVisibility.addEventListener('click', togglePasswordVisibility);
}
if (generateBtn) {
  generateBtn.addEventListener('click', generatePassword);
}
if (copyBtn) {
  copyBtn.addEventListener('click', copyGeneratedPassword);
}
if (lengthRange && lengthValueLabel) {
  lengthRange.addEventListener('input', () => {
    lengthValueLabel.textContent = `${lengthRange.value} chars`;
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Thanks for reaching out. Your message has been captured locally for now.');
  });
}

if (authToggle) {
  authToggle.addEventListener('click', () => {
    const input = document.querySelector('.auth-input-group input');
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    authToggle.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });
}

if (lengthRange && lengthValueLabel) {
  lengthValueLabel.textContent = `${lengthRange.value} chars`;
}
renderRecentPasswords();
if (generatedPassword) {
  generatePassword();
}
