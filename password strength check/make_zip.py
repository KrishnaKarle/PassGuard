import os
import zipfile

base = r'c:\Users\krish\Downloads\password strength check'
out = os.path.join(base, 'passguard-deploy.zip')
files = ['index.html', 'netlify.toml', 'deploy-package.txt', 'static']

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in files:
        path = os.path.join(base, name)
        if os.path.isdir(path):
            for root, dirs, filenames in os.walk(path):
                for fn in filenames:
                    full = os.path.join(root, fn)
                    rel = os.path.relpath(full, base)
                    z.write(full, rel)
        else:
            z.write(path, os.path.basename(path))

print(out)
