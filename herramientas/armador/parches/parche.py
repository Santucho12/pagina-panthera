# Ayuda para editar los archivos de los armadores respetando sus saltos de línea (CRLF): parche(ruta, [(viejo, nuevo), ...])
import io
def parche(ruta, cambios):
    s = io.open(ruta, encoding='utf8', newline='').read()
    eol = '\r\n' if '\r\n' in s else '\n'
    for viejo, nuevo in cambios:
        v, n = viejo.replace('\n', eol), nuevo.replace('\n', eol)
        assert s.count(v) == 1, ('se esperaba 1 vez, hay %d: %s' % (s.count(v), viejo[:80]))
        s = s.replace(v, n)
    io.open(ruta, 'w', encoding='utf8', newline='').write(s)
    print('ok', ruta, len(cambios), 'cambios')
