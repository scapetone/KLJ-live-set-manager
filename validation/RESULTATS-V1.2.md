# Validation V1.2 — 3 novembre 2026

## Périmètre et conservation des données

Correction de l’interface existante : ROOT et SCALE séparés, un même sélecteur natif pour ROOT/SCALE/PUSH/PUSH MODE, OFF rouge atténué, et inclusion des pistes MIDI normales même vides. La piste porteuse, les groupes, pistes audio, retours et master restent exclus. Le contrôle des cibles à chaque écriture MIDI est conservé.

Le moteur de détection et de rappel n’a pas été reconstruit. La seule évolution de son périmètre est le prédicat d’éligibilité demandé : l’instrument chargé n’est plus requis. Les propriétés écrites et leur ordre restent identiques ; aucune commande ARM, Monitor, volume ou activateur audio n’a été ajoutée. Le script utilisateur libre conserve ses limites de sandbox.

Le format reste **version 1**, avec les mêmes champs et le même paramètre Blob `KLJ Configurations`. ROOT et SCALE affichent séparément `root` et `scale`, qui existaient déjà. Les états et clés des anciennes pistes instrumentales restent conservés. Une nouvelle piste MIDI vide reçoit OFF, sans écriture immédiate ; y charger un instrument conserve ensuite sa clé et ses états.

Le musicien a confirmé dans Live la V1.1 : noms, rappels BPM et ON/OFF, identification des instruments et sauvegarde/réouverture des configurations. Ces résultats viennent de son essai, pas des tests simulés de Codex.

## Diagnostic commun des interactions

Un vrai clic dans KEY de la V1.1 liée à Live a reproduit l’absence de sélecteur visible. Un banc natif isolé a ensuite enregistré la séquence réellement émise par `jit.cellblock` :

```text
sync click 1 0 1 0
sync select 2 1
2 1 <contenu de cellule>
```

Les paramètres de `sync click` ne sont pas les indices de cellule. La V1.2 associe désormais le clic au `sync select` qui suit ; les sorties de contenu et les sélections programmatiques ne déclenchent plus seules les menus ou les bascules. Les tests V1.1 par `select` et faux `sync click <col,row>` ne reproduisaient pas les interactions réelles.

Le positionnement présentait un second problème : les coordonnées relatives au patcher/front patcher étaient inadaptées à la fenêtre détachée, et la lecture de `mousestate` à travers un cordon retournant dans le même v8 dépendait du traitement de ses callbacks. La V1.2 utilise un polling Max natif en coordonnées écran, les coordonnées de **la fenêtre d’édition elle-même**, et une position de secours calculée à partir de la cellule lorsque le pointeur n’est pas disponible dans la grille. Le sélecteur est limité au rectangle visible et explicitement passé au premier plan (`bringtofront`). Ses dimensions et positions passent par `setboxattr`, API des attributs de boîte, plutôt que des messages d’objet ordinaires.

Un clic sur ROOT/SCALE/PUSH/MODE affiche le sélecteur ; cliquer sa flèche ouvre la liste native. C’est une interaction en deux clics avant le choix, pas un menu logiciel ou une saisie textuelle. Le menu peut être ramené au bord du viewport si la cellule est proche de celui-ci. CLIP et BPM restent éditables au clavier ; `colhead=0` évite de traiter toute la première colonne comme un en-tête non éditable. Seule la première ligne est un en-tête.

## Vérifications effectuées

| Vérification | Résultat | Portée exacte |
|---|---|---|
| 32 tests Node | Réussis | LiveAPI simulée : rappel complet, protections, pistes vides, sélection Push, compatibilité des sauvegardes V1.1, ordre natif click/select/cell, absence de double bascule, ancrage du menu, scripts et erreurs |
| Banc Max natif V1.2 | 25 assertions/notifications réussies | Vrais objets v8, jit.cellblock, umenu, textedit et pattr ; ROOT/SCALE, PUSH et quatre modes ; aller-retour des valeurs et script multiligne ; erreur JS suivie d’un script valide |
| Interactions dans la fenêtre Max flottante | Ouverture réelle des quatre sélecteurs par clics, choix natifs reçus, grille mise à jour | Banc isolé utilisant le vrai sous-patcher et le vrai JS UI ; ROOT D#, SCALE Messiaen 6, PUSH 3 — TEST KEYS, mode 64 PADS ; ON vert/OFF rouge observés |
| Choix dans les listes natives | Validés au clavier après ouverture à la souris | Les popups système n’étaient pas entièrement accessibles/capturés par l’outil. Le parcours **tout à la souris dans Ableton** reste à confirmer par le musicien |
| AMXD et sources | Vérifiés structurellement | Conteneur MIDI natif `ampf`/`mmmm`, patch complet V1.2, sous-patcher exact, 19 connexions principales, paramètre Blob inchangé, état livré vide, quatre JS adjacents |

Rapports réels : [banc natif](native-smoke-v1.2.json), [événements souris et valeurs reçues](mouse-native-v1.2.json). Le banc de souris n’appelle pas LiveAPI et ne modifie pas le Set. Le banc natif automatisé utilise des messages reproduisant le protocole constaté ; il est distinct des clics effectués par l’outil de contrôle de Max.

L’AMXD V1.2 met à jour le chunk `ptch` du conteneur MIDI exporté par Max pour la V1, méthode déjà utilisée pour la V1.1 chargée et testée par le musicien. Ce n’est pas un JSON renommé. Il reste non gelé, avec les quatre JS adjacents. Le validateur compare le sous-patcher complet, la version visible et les connexions aux sources ; le manifeste de l’archive vérifie les octets réellement livrés. Aucun nouveau Save As depuis Live n’est revendiqué en V1.2.

## Essai restant au musicien

Suivre le [parcours V1.2](../LIVE_TESTS.md), sur une copie du Set :

- Cliquer chaque cellule et choisir **à la souris**, y compris après déplacement de fenêtre et défilement des deux axes.
- Choisir une piste PUSH, lancer son clip et vérifier **la piste sélectionnée dans Live**, indépendamment de la capacité à jouer l’instrument avec Push 2. L’appel `Song.View.selected_track` est conservé et relu par le moteur ; son effet réel en V1.2 n’est pas présenté comme testé par le banc isolé.
- Tester ensuite le jeu Push, sans changement automatique ARM/Monitor. Les quatre modes matériels restent manuels.
- Sauvegarder/rouvrir avec les choix ROOT/SCALE/PUSH/MODE, les anciennes lignes et les pistes MIDI vides. L’aller-retour pattr natif est réussi ; la sauvegarde `.als` V1.2 reste une vérification Live distincte.
- Vérifier que les huit stems gardent volumes et activateurs inchangés.

Le chargement final du nouvel AMXD dans Live, ces choix à la souris, le rappel musical V1.2 et le jeu physique Push ne sont pas déclarés validés ici. Le musicien a explicitement proposé de réaliser ces essais.

## Reproduire

```sh
node --test tests/engine.test.cjs
python3 tools/build_patch.py
python3 tools/build_amxd.py
python3 tools/validate_patch.py
python3 tools/package.py
```

Bancs : `python3 tools/build_max_smoke.py` et `python3 tools/build_mouse_probe.py`, puis ouvrir les `.maxpat` générés dans Max 9. Le premier écrit `/tmp/klj-max-smoke-v1.2.json` ; le second ouvre la vraie fenêtre d’édition et journalise les interactions dans `/tmp/klj-mouse-probe.json`. Adapter ces chemins sur Windows.

Références natives : [jit.cellblock](https://docs.cycling74.com/reference/jit.cellblock), [mousestate](https://docs.cycling74.com/reference/mousestate/), [Maxobj.setboxattr](https://docs.cycling74.com/apiref/js/maxobj/), [Patcher.bringtofront](https://docs.cycling74.com/apiref/js/patcher/).
