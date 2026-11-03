# Validation V1.4 — finition graphique — 3 novembre 2026

## Livré

- Véritable conteneur MIDI `KLJ Live Set Manager V1.4.amxd`, patch source, projet et quatre JavaScript adjacents ; archive avec manifeste SHA-256.
- Palette anthracite et gris bleuté, titre contrasté, boutons natifs harmonisés, AJOUTER menthe, ON menthe / OFF rouge doux / PLUS orange. Ligne active verte avec accent renforcé sur sa cellule CLIP ; sélection d’édition distincte.
- Suppression des explications permanentes. Bandeau sombre d’avertissement, refermable, réservé aux diagnostics utiles ; succès/initialisation/inventaire normaux masqués. Un rappel réussi efface le bandeau. Une nouvelle occurrence du même avertissement refermé réserve à nouveau sa place sans recouvrir la grille.
- Panneau JavaScript repliable avec titre `JAVASCRIPT / configuration`, accent orange, monospace Menlo et bordure ; fermeture par × conserve le texte saisi.
- Colonnes MIDI entre 122 et 160 px logiques, titres tronqués par « … » selon leur largeur, recalculés à chaque redimensionnement. Noms complets conservés dans les données et listes PUSH. Défilements natifs conservés.

## Correction des en-têtes réellement vérifiée

La couleur de premier plan était trop proche du fond, mais la cause décisive était `readonly=1` sur le `jit.cellblock` d’en-têtes : les messages `set` ne remplissaient pas ses cellules dans cette version de Max. L’essai natif avec couleurs corrigées montrait encore une bande vide. Avec `readonly=0`, les titres sont apparus. `selmode=0` et `automouse=0` conservent une bande sans sélection ni édition utilisateur. Les couleurs sont aussi appliquées explicitement par cellule.

Les titres restent dans un second `jit.cellblock`, hors du défilement vertical. Son entrée de synchronisation reçoit le troisième outlet du corps, avec `hsync=1`, `vsync=0`, `selsync=0`. Un `deferlow → refresh` natif termine le rafraîchissement après les événements de synchronisation, pour éviter un dessin partiel lors des déplacements rapides de la barre horizontale. La sélection et les indices des configurations ne changent pas.

La synchronisation correspond au mécanisme natif décrit par [Cycling ’74](https://docs.cycling74.com/reference/jit.cellblock). La cause `readonly` et la visibilité des titres ont été constatées dans Max, pas déduites d’un test simulé.

## Moteur et données préservés

`klj.engine.js`, `klj.model.js` et `klj.runner.js` sont **identiques octet pour octet aux fichiers V1.3 présents au début de cette itération**. Empreintes dans `engine-unchanged-v1.4.json`.

Aucun changement de détection, BPM, ROOT/SCALE, activations MIDI, sélection Push, scripts, persistance ou protection des stems. Aucun ARM/Monitor/volume ajouté. Schéma version 1, références, scripts et paramètre Blob `KLJ Configurations` inchangés. Le champ historique `pushMode` reste sauvegardé sans réapparaître dans l’interface. Le journal moteur peut encore indiquer V1.3 ; le titre compact identifie la livraison V1.4.

## Vérifications réalisées

**39 tests Node réussis** (LiveAPI simulée), incluant les tests musicaux existants et les nouveaux cas : couleurs d’en-têtes après changement de structure, avertissement refermé puis répété, absence d’écriture lors de fermeture/redimensionnement, texte multiligne à la fermeture du panneau. Les mutations de pistes et les rappels musicaux sont ici des simulations.

**23 contrôles natifs Max réussis**, rapport brut `native-v1.4.json` : compilation réelle v8, contenu CLIP renvoyé par le `dump` de l’en-tête, éditions de noms, menus ROOT/SCALE/PUSH et leurs outlets, maintien du champ historique, texte multiligne avec accents/guillemets, exécution dynamique, erreur suivie d’une exécution valide et aller-retour du dictionnaire `pattr`. Ce dernier contrôle ne remplace pas une sauvegarde/réouverture `.als`.

**Essai visuel et interactions natifs**, Max 9.1.5 intégré accessible depuis Live 12.4.16, sur un banc indépendant sans LiveAPI :

- En-têtes effectivement visibles, alignés, noms longs tronqués ; lecture de la ligne active et couleurs.
- Fermeture de l’avertissement à la souris, grille récupérant l’espace disponible.
- Réduction de la fenêtre d’environ 1180 × 760 à 953 × 600, avec et sans panneau JavaScript ; boutons accessibles, grille adaptée.
- Défilements horizontal et vertical ; bande des titres restant en haut et suivant les colonnes.
- Fermeture du panneau script et restitution de la hauteur à la grille.
- ROOT et PUSH ouverts à la souris après redimensionnement ; choix validés au clavier dans les menus natifs. C# et une clé de piste PUSH ont été reçus par la vue. Le menu PUSH a été utilisé après défilement horizontal. Rapport d’événements `mouse-v1.4.json` pour le dernier banc.

L’interface du Set utilisateur V1.3 a seulement servi à ouvrir Max ; aucune configuration du Set n’a été éditée ni sauvegardée par ces essais. Les bancs ne commandent pas Live.

Structure source et AMXD contrôlée : connexions, menus, synchronisation, paramètre Blob / Stored Only, quatre dépendances, état livré vide, 19 cordons principaux et comparaison intégrale du sous-patcher d’édition. L’AMXD met à jour le chunk `ptch` du conteneur MIDI natif initialement exporté avec Max, comme les livraisons précédentes validées par le musicien ; aucun nouveau Save As depuis Live n’est revendiqué. Archive et manifeste vérifiés après conditionnement.

## À vérifier par le musicien

Suivre `LIVE_TESTS.md` sur une copie du Set : affichage dans le nouvel AMXD, choix entièrement à la souris des trois menus après redimensionnement/défilement, ajout/suppression d’une piste, rappel habituel, script et sauvegarde/réouverture. Le rendu après ces mutations est couvert automatiquement mais n’a pas été essayé dans le Set réel pendant cette itération. Le jeu Push 2 et la persistance `.als` V1.4 restent à vérifier ; les validations musicales V1.3 du musicien restent la référence.

## Limites graphiques assumées

La maquette est adaptée aux objets Max : les cellules proposent texte et flèche, puis le sélecteur natif superposé existant, plutôt que des widgets arrondis permanents dans chaque ligne. Son comportement est conservé. Les barres de défilement gardent le rendu système Max. Pas de coloration syntaxique, de framework, de jsui ni de nouvelle dépendance. Les menus ouverts se ferment au redimensionnement et se rouvrent au clic. Pour le confort, garder au moins 800 × 520.
