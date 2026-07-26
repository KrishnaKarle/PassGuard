# PassGuard

A modern password strength checker and generator built with a static frontend and optional backend support.

## Structure
- `index.html` - homepage
- `login.html` - login page
- `static/css/style.css` - styles
- `static/js/app.js` - frontend logic
- `app.py` - backend entry point (if you want to run locally with Flask)

## Run locally

### Static preview
Use a simple static server such as:

```bash
python -m http.server 8000
```

### Flask backend
If you want to use the backend route support, run:

```bash
python app.py
```

## Deploy
- Netlify: deploy the static files from the project root.
- Render / Railway: use the Flask backend entry point.
