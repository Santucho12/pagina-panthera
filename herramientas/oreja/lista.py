import os, json
fs = []
for d in ['', 'aros', 'aros-hd']:
    base = d or '.'
    for f in sorted(os.listdir(base)):
        full = os.path.join(base, f)
        if os.path.isdir(full) or f in ('index.html', '_prueba.html'): continue
        p = (d + '/' + f) if d else f
        e = {'path': p}
        if f.endswith('.bin'): e['contentType'] = 'application/octet-stream'
        fs.append(e)
print(len(fs), sum(os.path.getsize(f['path']) for f in fs) // 1024, 'KB')
print(json.dumps(fs, separators=(',', ':')))
