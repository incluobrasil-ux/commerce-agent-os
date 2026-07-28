# -*- coding: utf-8 -*-
"""Compara MOVECON/ local com o repositorio de trabalho movecon-site.

Existe porque o problema ja aconteceu DUAS vezes: 57 commits nunca enviados em
26/07, e 12 commits parados em 27/07 que levaram outra maquina a clonar um
remoto defasado e produzir um relatorio inteiro de divergencias falsas.

Nas duas vezes o sintoma foi o mesmo: nada quebrou, nada avisou, e o trabalho
simplesmente nao existia fora da maquina. Por isso a checagem compara o
CONTEUDO - hash de cada arquivo -, e nao a contagem de commits: contagem
diverge por rebase e por merge sem que nada esteja errado; conteudo, nao.

Uso:
    python scripts/verificar_sync.py          # exit 1 se houver divergencia
    python scripts/verificar_sync.py --aviso  # sempre exit 0, so informa
"""
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MONO = os.path.dirname(os.path.dirname(RAIZ))   # .../commerce-agent-os
PREFIXO = 'MOVECON/'
REMOTO = 'movecon'
RAMO = 'main'


def git(args, cwd=MONO):
    r = subprocess.run(['git'] + args, capture_output=True, text=True, cwd=cwd)
    return r.returncode, r.stdout, r.stderr


def arvore(linhas, corta):
    """nome -> hash do blob, com o quoting do git desfeito."""
    d = {}
    for l in linhas.splitlines():
        if not l.strip() or '\t' not in l:
            continue
        meta, nome = l.split('\t', 1)
        partes = meta.split()
        if len(partes) < 3:
            continue
        nome = nome.strip().strip('"')
        if corta and nome.startswith(PREFIXO):
            nome = nome[len(PREFIXO):]
        d[nome] = partes[2]
    return d


def main():
    aviso = '--aviso' in sys.argv

    code, _, _ = git(['fetch', REMOTO, '--quiet'])
    if code != 0:
        print('[!] nao consegui consultar o remoto %s - checagem pulada.' % REMOTO)
        return 0

    _, loc, _ = git(['ls-tree', '-r', 'HEAD', '--', PREFIXO])
    _, rem, _ = git(['ls-tree', '-r', '%s/%s' % (REMOTO, RAMO)])
    L = arvore(loc, True)
    R = arvore(rem, False)

    so_local = sorted(k for k in L if k not in R)
    so_remoto = sorted(k for k in R if k not in L)
    difere = sorted(k for k in L if k in R and L[k] != R[k])

    total = len(so_local) + len(so_remoto) + len(difere)
    if not total:
        print('[OK] MOVECON/ sincronizado com %s/%s - %d arquivos, zero '
              'divergencia.' % (REMOTO, RAMO, len(L)))
        return 0

    print('')
    print('=' * 68)
    print('  TRABALHO NAO PUBLICADO NO movecon-site')
    print('=' * 68)
    if so_local:
        print('  %d arquivo(s) so existem aqui:' % len(so_local))
        for f in so_local[:8]:
            print('     + %s' % f)
        if len(so_local) > 8:
            print('     ... e mais %d' % (len(so_local) - 8))
    if difere:
        print('  %d arquivo(s) com conteudo diferente:' % len(difere))
        for f in difere[:8]:
            print('     ~ %s' % f)
        if len(difere) > 8:
            print('     ... e mais %d' % (len(difere) - 8))
    if so_remoto:
        print('  %d arquivo(s) so existem no remoto:' % len(so_remoto))
        for f in so_remoto[:8]:
            print('     - %s' % f)
    print('')
    print('  COMO PUBLICAR (o subtree push esta aposentado - ver')
    print('  docs/repositorio.md):')
    print('')
    print('    cd <clone do movecon-site>')
    print('    git pull --ff-only origin main')
    print('    # copiar os arquivos alterados de MOVECON/ para o clone')
    print('    git add -A && git commit && git push origin main')
    print('')
    print('=' * 68)
    return 0 if aviso else 1


if __name__ == '__main__':
    sys.exit(main())
