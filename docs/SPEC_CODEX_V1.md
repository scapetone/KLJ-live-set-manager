# KLJ Live Set Manager — Spécification consolidée V1 pour Codex

**Date : 2026-11-02**  
**État : prêt pour une revue de faisabilité en mode Plan ; code non commencé, tests Live/Push non réalisés.**  
**Source de vérité des arbitrages :** [journal D-001 à D-036](DECISIONS.md). En cas de formulation contradictoire dans les notes exploratoires, privilégier les **décisions récentes et spécifiques au Set KLJ**, et signaler toute contradiction persistante **sans inventer de règle produit**.

## 1. Objectif et périmètre

Réaliser **un device Max for Live pour Ableton Live 12**, utilisable avec **Push 2**, destiné au concert **Kiss La Joue (KLJ)**. Il remplace la logique de déclenchement des configurations ClyphX **sans copier le langage ou l'architecture ClyphX**.

Le musicien lance normalement une **scène**, un **clip** ou attend une **Follow Action** : lorsqu'un **clip de contrôle nommé** démarre réellement sur la piste dédiée, le device applique **la configuration complète** qui porte exactement ce nom.

Le fonctionnement musical du Live Set n'est pas modifié : Session View, clips audio, boucles, Follow Actions, progression des morceaux, transitions entre deux decks de stems.

**Set de référence :** huit pistes audio de stems (4 deck A + 4 deck B : Kick, Drums, Bass, Instru), contrôlées **manuellement par APC** ; une piste de contrôle avec des clips sans audio ; pistes MIDI instrumentales jouées par un clavier Vortex et par Push 2. Le clavier peut jouer **deux instruments simultanément**, notamment sur Breathe.

**Priorité : livrer vite une V1 KLJ fonctionnelle et stable.** Pas de plugin universel, système de commandes propriétaire, moteur de Follow Actions ni produit générique multi-projets.

## 2. Installation et déclenchements

- **Installer le device sur la piste qui contient les clips de contrôle** ; découvrir sa piste via `this_device canonical_parent`. Aucun sélecteur pour désigner une autre piste.
- Un **nom exact** de clip correspond à une **ligne** de configuration : `HOW_DARE_YOU_A`, `TRUE_PEAK_B`, etc. Pas de marqueurs `$...` ni de syntaxe ClyphX. Plusieurs clips peuvent porter le même nom et donc rappeler la même configuration.
- Au **début effectif** d'un clip, appliquer la ligne (lancement manuel de clip, scène, Follow Action).
- Un **tour de boucle naturel** du même clip **ne doit pas** réexécuter la configuration ou le script.
- Le lancement d'**un autre clip**, même avec le même nom, applique à nouveau la configuration.
- **Relancer le même slot** manuellement ou via `Play Again` : comportement requis en intention, mais **la faisabilité d'une distinction fiable vis-à-vis d'une boucle doit être prouvée dans Live**. `Track.playing_slot_index` seul est insuffisant. Pas de faux déclenchements à chaque tour pour contourner le problème.
- Clip sans ligne correspondante : **ne rien appliquer**, montrer un message non bloquant. Ne pas gêner la progression musicale.

## 3. Modèle de configuration

Chaque **ligne indépendante et complète** comprend les données suivantes :

| Champ | Sens / usage |
|---|---|
| `CLIP` | Nom unique de la configuration, égal au nom exact du clip déclencheur |
| `BPM` | Tempo de Live à appliquer |
| `KEY` | Fondamentale + gamme, par exemple `C Minor` ; paramètres musicaux de Live |
| Colonnes `n° — NOM PISTE` | Un interrupteur **Track Activator ON/OFF par piste MIDI instrumentale**, **plusieurs ON simultanément** possibles |
| `PUSH` | **Piste MIDI à sélectionner** dans Live pour le jeu au Push 2, affichée de façon lisible par numéro actuel + nom |
| `PUSH MODE` | Intention de disposition Push : `NOTE`, `NOTE IN KEY`, `PADS`, `64 PADS` (**automatisation non prouvée** ; voir § 7) |
| Détails facultatifs | Texte **JavaScript natif** multiligne pour des actions particulières (exemple : effet de True Peak) ; autres options Push seulement si faisables |

**Une configuration n'est pas une liste d'actions partielles :** chaque déclencheur rappelle toutes les valeurs du périmètre géré. Pour un changement de tempo seul, on **duplique la ligne complète** et on change son BPM. Éviter, quand possible, les écritures redondantes qui pourraient couper une queue de son.

Le contrôle ON/OFF d'une piste correspond à **Live Track Activator**, accessible par `Track.mute` (**0 = ON ; 1 = OFF**). **Ne pas** confondre avec `Device On`. Un effet exceptionnel (True Peak) est piloté séparément par le script.

**Interdiction absolue :** ne pas écrire dans **les volumes ni les Track Activators/Mute des huit pistes audio de stems**. Leur mixage reste sur APC, y compris lors d'une scène ou d'un changement de configuration. Une ancienne décision exploratoire mentionne des colonnes audio (D-014), mais les décisions KLJ ultérieures D-018/D-023/D-033 et l'interface approuvée recentrent les interrupteurs de la V1 sur les **instruments MIDI**. Ne pas exploiter cette contradiction pour muter les stems.

## 4. Synchronisation des pistes MIDI

- Construire dynamiquement les colonnes d'après les pistes MIDI instrumentales présentes dans Live ; en-tête **`n° actuel — nom`** ; **ordre exactement identique à Live**.
- Les états sont associés à **l'identité logique de la piste nommée**, jamais uniquement à sa position. Une réorganisation de Live déplace **la colonne avec ses états**, sans attribuer les commandes à un autre instrument.
- Lors d'un **renommage observé pendant la session**, mettre à jour la référence des configurations si l'identité de la piste active est connue. Ne pas promettre la reconstitution d'un renommage hors session.
- **Noms de pistes MIDI supposés uniques** (convention prise en charge par l'utilisateur) ; en cas d'ambiguïté, avertissement simple et **ne pas envoyer une commande arbitrairement au premier homonyme**.
- **Nouvelle piste MIDI instrumentale** : nouvelle colonne ; **OFF dans toutes les configurations existantes**, sans modifier immédiatement l'état physique de la piste nouvellement créée.
- **Piste MIDI supprimée** : enlever la colonne et ses états sauvegardés, **sans colonne fantôme**, sans restauration ni système de migration. Une piste recréée est nouvelle, et repart OFF. Distinction suppression vs réorganisation/renommage à tester.
- Ne pas utiliser l'identifiant Live API transitoire comme **seule référence persistante** dans l'ALS.

## 5. Comportement MIDI clavier et Push

**Clavier Vortex :** chaque instrument concerné possède son `MIDI From` fixé au clavier ; plusieurs instruments peuvent être ON simultanément et tous jouer. Le device n'a pas à sélectionner les pistes clavier.

**Push 2 :** lorsque le clip change la configuration, rendre active la piste prévue et **la sélectionner dans Live** (`Song.View.selected_track`) pour que Push joue le bon instrument.

**Orientation simple D-022, à tester sur le matériel :** toutes les pistes MIDI de performance ont `Monitor IN` permanent et un routage `MIDI From` déjà réglé dans Live. Le device ne change ni `Monitor` ni `ARM` à chaque transition. **Ne pas introduire une logique d'armement explicite en V1** sans échec démontré à l'essai Push / clavier. Les pistes instrumentales KLJ actuelles ne contiennent pas de clips MIDI.

**Critère principal :** le Vortex joue seulement ses instruments actifs, Push seulement le sien, sans note fantôme ou activation accidentelle, même quand deux pistes clavier sont actives.

## 6. Interface et direction graphique validées

**Référence visuelle détaillée :** [MAQUETTE_UI.md](MAQUETTE_UI.md) précise la structure de la fenêtre, les interactions, les colonnes, les états et la palette. Le texte est une maquette descriptive : aucune image ni patch Max n'a été livré à ce stade.

**Deux surfaces :**

1. **Mini-device intégré dans Live** : nom de la configuration en cours, état/avertissement, accès à l'éditeur.
2. **Grande fenêtre indépendante d'édition** : interface **sombre, sobre, contrastée et lisible**, inspirée de la maquette KLJ approuvée. Le **tableau est l'écran principal**, pas une succession de formulaires.

**Colonnes du tableau :** `CLIP | BPM | KEY | [n° — nom de chaque piste MIDI : ON/OFF] | PUSH | PUSH MODE | PLUS`. La vue doit permettre de **défiler horizontalement** si les pistes ne rentrent pas à l'écran, et verticalement lorsque les configurations se multiplient.

- Édition directe dans les cellules ; la création d'une configuration simple ne nécessite **jamais** d'ouvrir le panneau de détails.
- **Ajouter une ligne**, **Supprimer** ; **Dupliquer** une ligne en clonant toutes ses données **si le coût d'implémentation reste faible** ; le nouveau nom de configuration doit être distinct.
- L'action `PLUS` ouvre **dans la même fenêtre** un panneau repliable de la ligne, avec **script JavaScript natif multiligne**, autres paramètres complémentaires vraiment nécessaires, et diagnostics.
- Différencier visuellement ON/OFF, ligne en cours de lecture, script présent et erreur non bloquante. **Ne pas confondre** une maquette à données fictives avec une liste réelle de pistes.
- Privilégier les objets UI Max existants pour l'édition, le scroll et le texte. Un dessin graphique custom peut améliorer les détails visuels, **mais ne doit pas imposer la réécriture intégrale du tableau avec `v8ui`** si cela coûte trop cher.

**Évolution par rapport à D-023 :** `KEY` et `PUSH MODE` sont désormais **dans la grille principale** (D-035) ; ne pas les enterrer dans le panneau avancé.

## 7. Push 2 — les quatre modes et la limite technique décisive

| Valeur affichée | Intention musicale exacte |
|---|---|
| `NOTE` | Jeu mélodique chromatique |
| `NOTE IN KEY` | Jeu mélodique limité aux notes de la gamme `KEY` |
| `PADS` | **Drum Rack classique : 16 pads de jeu + séquenceur** |
| `64 PADS` | Drum Rack : les **64 pads de la grille** sont jouables |

**À ne pas présenter comme déjà implémenté.** La documentation actuelle distingue :
- Propriétés globales de Live pour fondamentale/gamme (`Song.root_note`, `Song.scale_name`) : **commandables**.
- Mode de pads actif (`ControlSurface.pad_layout`) : **`get/observe` uniquement**, sans `set` documenté.
- `Song.scale_mode` **n'est pas** une commande de bascule Push `In Key / Chromatic`.
- Les Push Actions ClyphX historiques ne sont pas compatibles avec l'intégration native de Push 2 Live 12 sans le script legacy ; **ne pas réintroduire la dépendance legacy**, qui est soupçonnée de contribuer aux redémarrages du contrôleur dans le Set.

**Instruction à Codex :** explorer une voie **fiable, documentée et compatible Live 12** pour automatiser ces quatre modes. Faire un PoC sur le Push réel. **Si impossible, ne jamais faire croire que sélectionner `PUSH MODE` dans une cellule change effectivement Push** : rendre la limite visible et remonter le compromis à l'utilisateur avant de figer le comportement produit. La sélection de piste Push, elle, reste **obligatoire** en V1 ; l'imposition des dispositions avancées demeure conditionnelle selon D-010/D-035.

## 8. JavaScript libre par configuration

Chaque configuration peut avoir un **script JavaScript Max natif**, édité dans un champ multiligne intégré à la fenêtre. Le déclenchement exécute ce texte en complément des réglages normaux, avec accès direct aux API Max for Live et `LiveAPI` ; **aucune DSL, syntaxe ClyphX, bibliothèque de commandes maison ou fichier JS externe par configuration**.

**Approche candidate, pas encore prouvée :** `text.codebox` (édition) + `v8` (moteur), évaluation dynamique via `eval(source)` ou `new Function(source)` **à l'intérieur du moteur JS**, **après l'initialisation du device**. Ces fonctions ne constituent pas une commande `eval` documentée comme message entrant de l'objet `v8`. Voir [l'étude dédiée](FAISABILITE_SCRIPTS_JS.md).

**Ordre proposé (non validé comme règle produit définitive) :** appliquer les valeurs standards, **puis** le script personnalisé ; le rendre explicite dans la revue Codex.

Capturer les erreurs syntaxiques et d'exécution, les signaler, et permettre aux clips suivants de fonctionner. Le `try/catch` **ne protège pas d'une boucle infinie** ; le code libre est créé par l'utilisateur, pas par un tiers inconnu.

**PoC bloquant :** prouver chaîne éditée → évaluation JS native → `LiveAPI` → effet bénin sur Set de test → sauvegarde ALS → fermeture/réouverture → texte strictement identique (y compris multiligne, guillemets, accents). Si cette chaîne ne fonctionne pas, **ne pas inventer un interpréteur maison** : remonter la difficulté.

## 9. Persistance et comportement scénique

- Toutes les lignes et leurs valeurs (noms, BPM, pistes, Push, KEY, scripts) se sauvegardent avec le **Live Set `.als`** par un stockage d'état compatible Max for Live. **Aucun fichier de configuration externe obligatoire.**
- Le device restaure fidèlement l'ensemble après fermeture/réouverture. **Tester plusieurs configurations et plusieurs scripts**, y compris après duplication, ajout et suppression de pistes MIDI.
- Ne pas bloquer la lecture audio ni les Follow Actions pour une erreur d'édition ou de JavaScript.
- Lors des déclenchements, limiter les opérations redondantes quand c'est possible, notamment pour préserver les queues de réverbération et la continuité instrumentale.
- Le souhait de limiter le CPU est réel (D-011), mais **Track Activator OFF n'est pas une garantie de CPU réduit** : mesurer avant de proposer des bypass additionnels risquant une coupure ou un son suspendu.

## 10. Tests et critères d'acceptation

Lire et exécuter en priorité les trois PoC documentés dans [VALIDATION_TECHNIQUE_CODEX.md](VALIDATION_TECHNIQUE_CODEX.md) :

**P1 — Détection :** lancement via scène, clip et Follow Action ; plusieurs tours de boucle sans relance ; autre clip au même nom ; Play Again sur même slot si distinguable.

**P2 — MIDI/Push :** sélection réelle Push 2, monitoring/routage stable avec Vortex, deux instruments clavier actifs, KEY sur Live et sur pads, inspection du mode de pads, test des quatre dispositions si une méthode fiable est trouvée.

**P3 — Script :** édition/évaluation JavaScript Max + `LiveAPI`, erreur récupérable, plusieurs configurations et persistance strictement fidèle dans un ALS rouvert.

**Régression sur mini Set représentatif :**

1. Configurations `HOW_DARE_YOU_A/B` : activations MIDI, tempo, KEY et sélection Push corrects après scène et Follow Action.
2. `BREATHE` : deux instruments Vortex jouables simultanément sans intrusion dans la piste Push.
3. `TRUE_PEAK_A/B` : script indépendant commandant `Device On` d'un effet de test, **sans toucher aux activateurs/volumes des stems**.
4. Modifier l'ordre des pistes MIDI et leurs noms : colonnes et cibles cohérentes. Ajouter une piste : OFF partout. Supprimer puis recréer : nouvelle piste OFF.
5. Clip de contrôle inconnu : aucun changement de configuration appliqué, avertissement discret.
6. Sauvegarder et rouvrir le Set : toutes les lignes et scripts intacts ; lancer de nouveau les clips.
7. Vérifier la **continuité sonore**, les éventuels redémarrages de Push 2, les pics CPU et l'absence d'activation accidentelle d'un stem audio.

**La réussite des PoC n'est pas encore constatée.** Codex peut préparer le code de test, mais les cas impliquant Live ou Push doivent être confirmés avec le matériel et la version exacte utilisés par KLJ.

## 11. Travail demandé à Codex — étape Plan d'abord

1. **Lire** ce document, [DECISIONS.md](DECISIONS.md), [FAISABILITE_SCRIPTS_JS.md](FAISABILITE_SCRIPTS_JS.md), [VALIDATION_TECHNIQUE_CODEX.md](VALIDATION_TECHNIQUE_CODEX.md). Consulter les notes détaillées [BRIEF_PRODUIT.md](BRIEF_PRODUIT.md) si nécessaire.
2. **Proposer une architecture Max for Live minimale** : UI tableau/fenêtre + données persistées + observateurs Live API + moteur d'application + script utilisateur. Indiquer les objets Max recommandés et les responsabilités.
3. **Classer chaque fonction en :** API documentée / PoC Live nécessaire / impossible avec l'API publique actuelle / optionnelle ; en particulier le **mode Push**, la relance du même slot et le JS dynamique.
4. **Signaler uniquement les contradictions ou questions réellement bloquantes**, sans sur-ingénierie ni questionnaires extensifs. Ne pas décider seul de remplacer les 4 modes Push par des boutons décoratifs.
5. Après validation du Plan, **développer la V1 cohérente**, préparer un `.amxd` installable, le code source/patchs, un mini Live Set de tests si possible, une documentation d'installation et une checklist d'essais matériel.
6. **Ne jamais annoncer qu'un patch non testé dans Live est prêt pour concert.**

### Instruction de démarrage à copier dans Codex

> Lis `docs/SPEC_CODEX_V1.md` comme contrat de réalisation, puis `docs/DECISIONS.md`, `docs/VALIDATION_TECHNIQUE_CODEX.md` et `docs/FAISABILITE_SCRIPTS_JS.md`. En mode Plan, propose l'architecture Max for Live V1 la plus simple et la séquence de PoC P1/P2/P3, signale honnêtement les limites de contrôle des modes Push 2 natifs, des relances du même slot et des scripts JS dynamiques. Protège absolument les huit stems audio contrôlés via APC. N'implémente pas de langage ClyphX ni de moteur générique. Produis un plan de développement suffisamment précis pour viser une implémentation cohérente en une passe après validation des risques bloquants.

## Annexes et traçabilité

- [Décisions D-001 à D-036](DECISIONS.md) : arbitrages approuvés.
- [Brief produit exploratoire](BRIEF_PRODUIT.md) : contexte et historique, certaines idées initiales ont été affinées ou remplacées.
- [Questions ouvertes](QUESTIONS_OUVERTES.md) : détails non résolus et risques.
- [Étude exécution JavaScript](FAISABILITE_SCRIPTS_JS.md) : documentation et protocole PoC.
- [Maquette UI approuvée](MAQUETTE_UI.md) : structure visuelle et palette à reproduire sans sur-ingénierie.
- [AGENTS.md](../AGENTS.md) : consignes spécifiques au dépôt pour Codex.
- [Validation technique ciblée](VALIDATION_TECHNIQUE_CODEX.md) : essais P1/P2/P3 et régression.
