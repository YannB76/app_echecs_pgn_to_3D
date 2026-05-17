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

## Modeles OBJ optionnels

Le bouton `Pieces 3D` charge des modeles OBJ locaux si le dossier suivant existe :

```text
assets/models/chess-obj/OBJ Files/
```

Le menu `Options > Themes > Pieces` peut aussi charger un second set local si ce dossier existe :

```text
assets/models/classic-obj/
```

Les OBJ CGTrader extraits sont volontairement ignores par Git, car ils pesent plusieurs centaines de Mo. Pour une version publique fluide sur GitHub Pages, il faudra convertir ces modeles en `.glb` optimises avant de les ajouter au depot.
