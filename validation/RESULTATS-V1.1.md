# Validation V1.1 — 3 novembre 2026

## Corrections et cause des défauts

**Noms.** Le banc réellement exécuté dans Max 9.1.5 isole `jit.cellblock` du modèle, de `pattr` et de Live. En `outmode 2`, chaque sortie d’une cellule contenant un symbole ajoute **un espace** : `"A "` (longueur 2), puis `"A  "` (3), jusqu’à longueur 11 après dix allers-retours. La V1 conservait ce texte sans le nettoyer, le réinjectait dans la grille, le persistait tel quel, puis comparait exactement le nom du clip. L’accumulation commence donc à la sortie de la grille. Le test mesure un espace par sortie ; il ne prétend pas avoir mesuré au clavier les deux sorties d’une édition complète rapportées par le musicien.

La V1.1 utilise **outmode 0**. Les dix sorties natives successives de `A` ont toutes longueur 1 ; les dix sorties de `B  C` conservent les deux espaces internes et la longueur 4. [Mesures brutes et longueurs](names-native-v1.1.json).

Le modèle nettoie les espaces externes à la saisie et lors de la restauration, puis le moteur nettoie le nom du clip avant comparaison. Les autres champs sont conservés. Les collisions après nettoyage reçoivent un suffixe unique et un diagnostic. Le mode de données reste version 1 pour restaurer les configurations V1. Le message `debugnames 1` au moteur active les traces supplémentaires grille/modèle/pattr/comparaison ; les corrections d’anciens noms sont toujours journalisées.

**Menus.** La V1 refermait le sélecteur sur `sync click`, émis après sa sélection. La V1.1 ne le referme plus sur cette notification. KEY dispose de deux `umenu` natifs, fondamentale et gamme, dans une seule colonne. Les **35 noms** ont été relevés sans changer la sélection dans le menu natif de Live 12.4.16 ; plusieurs anciens noms étaient incorrects ou absents. Le choix des quatre modes Push est transmis au modèle, affiché et persisté, avec la mention de réglage manuel.

**Rappels.** Le moteur compare les valeurs actuelles de Live avant écriture, puis relit BPM, fondamentale, gamme, activateurs MIDI et sélection Push. Une divergence demandée/obtenue produit un diagnostic ; les opérations indépendantes continuent. Chaque rappel connu écrit en console `KLJ rappel` avec valeurs demandées, obtenues et avertissements. Aucune écriture de volume, ARM/Monitor ou activateur de piste audio n’a été ajoutée.

**Inventaire.** La règle reste MIDI + instrument. Les pistes MIDI vides restent exclues. Le statut indique explicitement l’absence d’instrument éligible ; l’arrivée d’un instrument met à jour la grille et les choix PUSH sans modification immédiate de son activateur.

## Validations réussies

- **29 tests Node**, LiveAPI explicitement simulée : événements, protections à chaque écriture, pistes dynamiques, erreurs JS et persistance ; dix éditions de `A` ; espaces internes ; migration avec collision sans perte ; menus KEY/Push avec `sync click` ; séquence `BPM_100 → KEY_Eminor → BPM_200 → BPM_100` avec changements manuels intermédiaires ; relecture d’un setter refusé ; arrivée d’un instrument et sélection Push.
- **Max 9.1.5 natif** : 23 assertions/notifications réussies dans le [rapport V1.1](native-smoke-v1.1.json). Vrais `jit.cellblock`, `umenu`, `textedit`, `pattr` et `v8` : noms stables, espaces internes, menus KEY restant visibles, E Minor reçu via les sorties des menus, quatre modes reçus, aller-retour des noms/KEY/modes et du script multiligne via `pattr`, exception volontaire puis script valide. Les sorties de menus sont déclenchées par messages Max ; ce banc ne constitue pas un parcours de clics dans Live.
- **Patch et livraison** : 56 objets Max, cordons, menus et métadonnées Blob / Stored Only vérifiés. Le nouvel AMXD V1.1 conserve le conteneur natif MIDI `ampf` / `mmmm` du device V1 exporté par Max, avec son chunk `ptch` remplacé par le patch corrigé complet. Le validateur compare notamment **l’intégralité du sous-patcher d’édition**, la version visible, les dépendances et les 19 connexions principales aux sources. État initial vide. Les quatre JS restent adjacents, comme en V1 ; le device n’est pas gelé.
- **Archive** : manifeste SHA-256 et comparaison des octets des fichiers livrés avec les sources actuelles, dont l’AMXD et les quatre JS. Le binaire V1 historique n’est pas présenté comme le device V1.1.

Reproduire sans installation de dépendance :

```sh
node --test tests/engine.test.cjs
python3 tools/build_patch.py
python3 tools/build_amxd.py
python3 tools/validate_patch.py
python3 tools/package.py
```

Bancs natifs : `python3 tools/build_name_probe.py` et `python3 tools/build_max_smoke.py`, puis ouvrir les patchs générés dans Max. Ils ne commandent pas Live. Les rapports temporaires sont écrits sous `/tmp` ; adapter ces chemins sur Windows.

## À vérifier par le musicien dans Live

Le nouveau conteneur AMXD est contrôlé structurellement ; **son chargement final dans Live, les rappels musicaux réels, le chargement d’un instrument dans un Set réel et la fermeture/réouverture `.als` ne sont pas déclarés validés en V1.1**. Max autonome affichait « saving disabled » ; la V1.1 n’a pas fait l’objet d’un nouveau Save As lié à Live. Les tentatives d’ouverture directe de l’AMXD depuis Max autonome n’ont pas abouti ; elles ne sont pas comptées comme validation de chargement.

Le musicien a proposé de réaliser ces essais. Suivre en premier les cinq étapes du [parcours correctif](../LIVE_TESTS.md) : `A` après dix éditions, KEY E Minor, ON/OFF + PUSH + quatre modes, séquence BPM, puis sauvegarde/réouverture. Consulter les valeurs `actual` de la console et vérifier les valeurs affichées dans Live.

Le passage par `pattr` natif et JSON est réussi ; **il ne prouve pas la sauvegarde dans le `.als`**. Déposer une nouvelle instance ne garantit pas la récupération des données d’une ancienne instance : garder l’ancienne et travailler sur une copie du Set jusqu’à vérification.

## Limites inchangées

- NOTE / NOTE IN KEY / PADS / 64 PADS sont mémorisés mais leur changement matériel reste **manuel**. La sélection de piste passe par `Song.View.selected_track`.
- Relancer le même slot sans transition observable arrêt/lecture n’est pas garanti. Une boucle naturelle ne provoque pas un rappel.
- Aucun test matériel Push 2 / Vortex / APC n’est revendiqué. Vérifier le jeu simultané et les stems avant/après dans le Set de test.
- Le JavaScript utilisateur n’est pas une sandbox ; une boucle infinie ou une erreur asynchrone utilisateur n’est pas isolée par le `try/catch` synchrone.
- Entre sessions, la correspondance des pistes repose sur leurs noms instrumentaux uniques ; aucun rapprochement approximatif.

Références natives : [jit.cellblock](https://docs.cycling74.com/reference/jit.cellblock), [Song](https://docs.cycling74.com/apiref/lom/song/), [pattr dans Live](https://docs.cycling74.com/userguide/m4l/live_pattr/).
