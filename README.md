# PGN vers rendu 3D

Cette application doit etre lancee via un petit serveur local, pas en ouvrant directement `index.html`.

## Lancement

Double-clique sur :

```bat
lancer_app.bat
```

Le script demarre un serveur local puis ouvre l'application dans le navigateur :

```text
http://127.0.0.1:4180/
```

Ouvrir `index.html` directement peut empecher le chargement de Three.js et chess.js, car le navigateur applique des restrictions aux modules JavaScript depuis `file://`.
