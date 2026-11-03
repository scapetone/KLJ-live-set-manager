# Validation V1.3 — finition UI — 3 novembre 2026

## Modifications

- La disposition lit la taille de la fenêtre d’édition avec un `qmetro 100` Max natif. Le recalcul ne se fait que si la taille change, ou lors d’un changement de structure/détails. Il redimensionne grille, bande des titres, script et commandes du bas. Un redimensionnement ne reconstruit pas les cellules et n’appelle pas la persistance.
- Les titres sont dans un second `jit.cellblock` en lecture seule, séparé du corps. Son défilement horizontal est synchronisé par le cordon natif `grid outlet 2 → headers inlet 1`, avec hsync=1, vsync=0, selsync=0. Il ne peut donc pas défiler verticalement avec les configurations. Le corps commence maintenant à la ligne 0 ; cette conversion concerne uniquement la vue et ses tests.
- Colonnes : largeurs minimales conservant le défilement quand nécessaire ; distribution de l’espace libre avec plafonds. Les pistes MIDI restent entre **122 et 160 px logiques**, quelle que soit la longueur du nom. Les titres trop longs sont tronqués avec « … », sans modifier les noms du modèle, la correspondance des pistes ou les choix PUSH complets.
- PUSH MODE et ses mentions ont disparu de l’interface, y compris du statut compact. Le champ `pushMode`, ses valeurs historiques, le schéma version 1 et le paramètre Blob restent inchangés. Les anciennes données et duplications ne sont pas supprimées.
- Ligne active verte, ligne éditée grise, combinaison des deux vert renforcé ; lignes alternées discrètes. Les noms CLIP restent bruts, sans symbole ajouté dans les données. Les couleurs ON vert/OFF rouge sont conservées.

## Préservation du moteur

Le musicien confirme désormais en Live avec ses instruments et Push 2 : détection des clips, BPM, ROOT/SCALE, ON/OFF MIDI, sélection automatique Push, JavaScript libre et persistance fonctionnels en V1.2.

Le modèle (`klj.model.js`) et le runner (`klj.runner.js`) sont **inchangés octet pour octet** depuis cette version. Le seul changement dans `klj.engine.js` concerne les libellés : suppression du message de mode manuel et mise à jour du numéro de version dans le journal. Ni les événements, ni les accès LiveAPI, ni l’ordre des commandes, ni les protections n’ont été modifiés. Aucune écriture audio, volume, ARM ou Monitor n’est ajoutée.

## Validations effectuées

**36 tests Node réussis**, avec LiveAPI explicitement simulée. Les tests musicaux existants sont conservés ; seuls les indices de lignes de la vue passent de 1 à 0. Les nouveaux tests couvrent :

- dimensions de grille et position des boutons après agrandissement ; panneau script contenu entre grille et actions ; menus bornés au nouveau viewport ;
- absence de modification d’état, de persistance et de commande Live lors du redimensionnement ;
- largeur maximale des pistes à noms longs, troncature uniquement visuelle et nom complet dans les choix PUSH ;
- titres attendus sans PUSH MODE et préservation du champ historique après clic PLUS et aller-retour JSON ;
- identification active indépendante de l’édition, sans modifier le nom des clips.

Le validateur contrôle les deux grilles, la synchronisation native des titres, le polling de disposition, tous les cordons, la persistance Blob / Stored Only, les dépendances et le nouveau conteneur MIDI AMXD. Le sous-patcher d’édition du binaire est comparé intégralement au source. Le manifeste de l’archive vérifie les octets réellement livrés. État livré vide ; mêmes quatre JS adjacents.

**Pas de nouveau test natif Max/Live revendiqué.** Les tentatives d’accès à Max et à Live ont retourné `timeoutReached`, y compris après inventaire des applications. Aucun résultat natif V1.2 n’est réétiqueté V1.3. Les bancs natifs sont mis à jour et disponibles pour exécution ultérieure ; le compte rendu distingue ces sources de test d’un résultat réellement exécuté.

L’AMXD V1.3 met à jour le patch complet `ptch` du conteneur MIDI natif exporté initialement par Max. Cette méthode est celle des versions V1.1/V1.2 chargées et testées par le musicien. Ce n’est pas un JSON renommé ; aucun nouveau Save As lié à Live n’est revendiqué.

## À vérifier dans Live

Voir le [parcours UI court](../LIVE_TESTS.md) : redimensionnement, deux axes de défilement, alignement des titres, menus après resize, mutation de pistes, ligne active, script et sauvegarde/réouverture. Les anciens champs musicaux et `pushMode` sont conservés dans les tests ; leur restauration par Live dans cette nouvelle livraison reste à confirmer. Utiliser une copie du Set et conserver l’ancienne instance jusqu’à récupération des lignes.

La synchronisation graphique exacte des en-têtes et le rendu natif de la disposition restent les points à confirmer en priorité. Taille de confort conseillée : au moins 800 × 520. Une fenêtre démesurément grande peut conserver une zone vide à droite une fois tous les plafonds de colonnes atteints ; les colonnes MIDI ne sont pas étirées pour combler cet espace.

## Reproduire

```sh
node --test tests/engine.test.cjs
python3 tools/build_patch.py
python3 tools/build_amxd.py
python3 tools/validate_patch.py
python3 tools/package.py
```

Bancs préparés : `python3 tools/build_max_smoke.py`, puis ouvrir `tests/max/generated/Native smoke.maxpat` dans Max 9 ; `python3 tools/build_mouse_probe.py` prépare une fenêtre avec quatre pistes, un nom long et quarante configurations pour les essais de scroll/resize. Les bancs n’appellent pas LiveAPI.

Références natives : [jit.cellblock — synchronisation d’en-têtes externes](https://docs.cycling74.com/reference/jit.cellblock), [Wind.size](https://docs.cycling74.com/apiref/js/wind/).
