# KLJ Live Set Manager — Brief V1 pour Codex

**Objectif : construire le device Max for Live maintenant, puis le faire tester par les musiciens.** Ce document est **la source de vérité**. Ne pas relire tout l'historique du projet pour redécider ce qui est déjà défini. Le design est décrit dans [MAQUETTE_UI.md](MAQUETTE_UI.md) (facultatif en première lecture).

## 1. Ce que doit faire le device

Dans **Ableton Live 12**, le Set de Kiss La Joue joue ses morceaux en **Session View**, avec des scènes et des **Follow Actions natives**. Une piste contient des clips MIDI de contrôle, sans son, nommés par exemple `HOW_DARE_YOU_A` ou `TRUE_PEAK_B`.

**Le device Max for Live est placé sur cette même piste**. Lorsqu'un clip de contrôle commence réellement à jouer, il recherche une ligne du tableau portant exactement le même nom et **applique sa configuration complète** : BPM, tonalité, instruments MIDI actifs, piste jouée par Push 2 et, si présent, script JavaScript spécial.

- Déclenchement par scène, lancement manuel ou Follow Action.
- **Une boucle naturelle ne redéclenche pas** la ligne ni son script, même si le clip fait plusieurs tours avant une Follow Action.
- Transition vers un autre clip : nouveau déclenchement, même si les deux clips portent le même nom.
- Relance du même slot / `Play Again` : essayer de distinguer un vrai lancement d'une boucle. Si l'API ne le permet pas de manière fiable, **documenter la limite** plutôt que redéclencher chaque tour.
- Nom inconnu : **aucune action**, avertissement non bloquant.
- Aucune syntaxe ClyphX : noms de clips simples (convention conseillée `MAJUSCULES_ET_UNDERSCORES`).

**Ne pas modifier** les scènes, les Follow Actions ou la progression musicale du Set.

## 2. Tableau et configurations

Une grande **fenêtre indépendante** sert d'éditeur. Un petit device dans la chaîne Ableton affiche le nom de la configuration active, l'état et une commande pour ouvrir l'éditeur.

**Disposition principale :**

```text
CLIP | BPM | KEY | [11 — KEYS] [12 — BASS] ... | PUSH | PUSH MODE | PLUS
```

Une **ligne par configuration complète**, editable directement dans les cellules. On peut **Ajouter**, **Renommer**, **Supprimer** ; **Dupliquer** copie toutes les données de la ligne si c'est facile à implémenter. Le tableau défile horizontalement et verticalement. `PLUS` déplie, **dans la même fenêtre**, un éditeur de **JavaScript natif multiligne** propre à la ligne. Aucun formulaire obligatoire pour une simple ligne. Design **sombre, soigné et lisible**, couleurs/structure dans [MAQUETTE_UI.md](MAQUETTE_UI.md) ; ne pas construire une UI complexe au détriment du fonctionnement.

Champs d'une ligne :
- **CLIP** : nom exact, unique entre configurations (plusieurs clips Live peuvent rappeler cette ligne).
- **BPM** : tempo de Live.
- **KEY** : fondamentale + gamme (`C Minor`, etc.) via les propriétés musicales Live 12.
- **Une colonne ON/OFF par piste MIDI instrumentale du Set** : piloter **Track Activator**, soit `Track.mute=0` pour ON et `1` pour OFF. **Plusieurs pistes peuvent être ON simultanément**.
- **PUSH** : sélectionner automatiquement la piste MIDI devant être jouée sur **Push 2**, affichée par **numéro actuel + nom** ; choix d'absence de sélection si utile.
- **PUSH MODE** : `NOTE` (mélodique chromatique), `NOTE IN KEY` (mélodique limité à KEY), `PADS` (Drum Rack classique : **16 pads et séquenceur**), `64 PADS` (Drum Rack sur **64 pads**). Voir la réserve technique § 5.
- **Script JS facultatif** : commande spéciale par configuration (exemple True Peak, bascule d'un `Device On` sans modifier les stems).

Chaque lancement rappelle **tous les paramètres du périmètre géré**. Pour une variation de BPM seule, dupliquer une ligne complète, puis changer le BPM. **Éviter les réécritures redondantes** et les coupures de notes/queues d'effets quand c'est possible.

## 3. Règles de sécurité absolues et routage

Le Set KLJ possède **8 pistes audio de stems** : 4 pour le deck A et 4 pour le deck B (Kick, Drums, Bass, Instru), jouées/mixées avec un contrôleur **APC**.

**Le device ne doit JAMAIS changer le volume, le Mute/Track Activator ou le mixage de ces huit pistes audio.** La matrice ON/OFF concerne **uniquement les instruments MIDI**. Les actions très spécifiques sur des effets (ex. True Peak) sont séparées et accessibles via le script JS.

Deux musiciens jouent :
- **Clavier Vortex** : pistes MIDI avec `MIDI From` dédié au clavier ; deux instruments peuvent jouer ensemble (ex. morceau `BREATHE`).
- **Push 2** : piste instrumentale activée + **piste sélectionnée dans Live** (équivalent de l'ancien `SEL`).

**Hypothèse V1 à tester dans Live :** le `MIDI From` et `Monitor IN` sont **configurés manuellement une fois** sur les pistes MIDI de jeu. Le device ne change **pas** Monitor ou ARM à chaque clip. Vérifier que Push ne fait jouer que son instrument et que le clavier peut jouer deux pistes. Si ce test échoue, ajuster *uniquement ce qui est indispensable*, sans reconstituer les resets globaux de ClyphX.

## 4. Pistes MIDI dynamiques

- Colonnes = **pistes MIDI instrumentales**, dans **l'ordre réel de Live**, avec **numéro de position + nom**.
- Si une piste est **déplacée**, la colonne bouge avec les états qui lui appartiennent, sans appliquer des réglages à l'ancienne position.
- Si elle est **renommée pendant la session**, suivre son identité lorsque possible et reporter le nouveau nom dans les configurations.
- L'utilisateur garde des **noms uniques** de pistes instrumentales. En cas de doublon ambigu, avertir et éviter une commande au mauvais instrument ; pas de gestionnaire de conflits.
- **Nouvelle piste** : nouvelle colonne, état **OFF pour toutes les configurations existantes**, mais ne pas modifier son état physique immédiatement.
- **Piste supprimée** : supprimer sa colonne et les données liées ; pas de « colonne fantôme » ou de restauration. Si recréée, elle repart comme nouvelle.
- Les identifiants Live API peuvent changer entre sessions : **ne pas persister l'ID transitoire comme unique référence**.

## 5. Push 2 : distinction entre besoin et faisabilité

**Indispensable en V1 :** sélectionner automatiquement la bonne piste jouée par Push. **KEY** est pilotable via `Song.root_note` / `Song.scale_name`.

Les 4 choix `PUSH MODE` sont souhaités directement dans le tableau, mais **leur automatisation avec l'intégration native de Push 2 sous Live 12 n'est pas démontrée** : `ControlSurface.pad_layout` est documenté en **lecture/observation, pas en écriture**. `Song.scale_mode` n'est pas la commande Push In Key.

**Ne pas réintroduire l'ancien Remote Script legacy Push** (redémarrages observés dans ce Set). Chercher une solution publique, fiable et compatible avec Live 12. Si elle n'existe pas, **ne pas fabriquer un contrôle qui prétend fonctionner** : conserver le besoin dans le modèle mais rendre la limitation explicite, et la remonter dans les instructions de test. **La V1 ne doit pas être bloquée uniquement par ces modes avancés.**

## 6. Scripts JavaScript et sauvegarde

Chaque ligne peut avoir **du JavaScript natif Max** (pas de DSL, pas de langage de commandes KLJ, pas de format ClyphX), pouvant appeler `LiveAPI`. Exemple : modifier le paramètre **Device On** d'un effet déterminé sur une piste pour True Peak.

- Champ de texte multiligne dans le détail de la ligne ; l'évaluation doit se faire **au déclenchement réel** du clip, pas à chaque tour de boucle.
- Approche à étudier : éditeur `text.codebox` ou `textedit`, moteur `v8`, évaluation dynamique **après l'initialisation** `live.thisdevice`. **Ne pas supposer que `v8` accepte nativement le message `eval <texte>`**.
- Par défaut, appliquer la configuration standard **avant** le script JS personnalisé. Capturer les erreurs de syntaxe/exécution et poursuivre avec les clips suivants. Un script libre avec boucle infinie ne peut pas être rendu sûr par un simple `try/catch`.
- **Toutes les configurations, y compris scripts complets, doivent être sauvées dans le Live Set `.als`**, sans fichier de données externe obligatoire. Tester sauvegarde/réouverture des scripts multiligne, guillemets, accents.
- Si la mécanique d'exécution dynamique ne peut pas être démontrée dans l'environnement disponible, fournir l'implémentation candidate et un test matériel clair, **sans annoncer que c'est validé**.

## 7. Ce qu'il faut livrer

**Ne t'arrête pas à un document de plan.** Développe le moteur, la matrice, la fenêtre et le système de sauvegarde, avec des composants Max/M4L simples ; vérifie au minimum la structure des fichiers générés.

À remettre :
1. **Patch source `.maxpat` et dépendances nécessaires**, dans une arborescence simple. Si Max est installé et accessible, exporter aussi le **`.amxd`**. Ne pas renommer simplement un JSON `.maxpat` en `.amxd` en prétendant que le device est valide.
2. Une courte **procédure d'installation** : placer le device sur la piste des clips de contrôle, vérifier les entrées MIDI, ouvrir le tableau, créer une ligne nommée comme un clip.
3. Une **liste de vérifications dans Live**, ciblée : lancement de scène, Follow Action, boucles répétées, MIDI Vortex + Push 2, 2 instruments simultanés, KEY, modes Push si possible, script True Peak, ajout/déplacement/suppression de piste, fermeture/réouverture du Set, et **zéro modification des stems APC**.
4. Un **bilan honnête** en trois colonnes : fonction implémentée / fonction non testée en Live / limite connue ou partiellement implémentée. Aucun résultat matériel inventé.

**D'abord un device utilisable à essayer, ensuite des corrections d'après les observations du musicien.** Pas de framework universel, d'intégration MCP imposée, de dépendance exotique, ni de nouveau cycle de questions produit.
