import os
import shutil
base = r'c:\Users\krish\Downloads\password strength check'
for name in ['app.py', 'requirements.txt']:
    path = os.path.join(base, name)
    if os.path.exists(path):
        os.remove(path)
shutil.rmtree(os.path.join(base, 'templates'), ignore_errors=True)
print('Removed Flask-specific files')
