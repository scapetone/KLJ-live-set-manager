# Audit de performances v1.5.1 — diagnostic et proposition

> Historical development report from 4 November 2026. The author later approved the final candidate for v1.6.0 publication on 6 November; see [release evidence](RELEASE-1.6.0.md).

Date : 4 novembre 2026. Référence : commit publié 3585bb8 / tag v1.5.1.

## Conclusion et niveau de preuve

Trois amplificateurs de charge sont démontrés : inventaire LiveAPI complet périodique avant comparaison de signature ; reconstruction intégrale du tableau lors de petites modifications ; vérification de l’ensemble des noms de pistes répétée pour chaque cible MIDI à chaque rappel. La persistance et le modèle ajoutent un coût proportionnel aux lignes et aux scripts pendant les éditions, mais ne sont pas sollicités à chaque cycle périodique inchangé.

La cadence du scan correspond aux pauses signalées toutes les deux secondes. Cela en fait un suspect sérieux, pas une preuve que ce scan provoque le curseur macOS. Son coût de travail mesuré ne dépend pas du nombre de configurations : il ne peut pas, seul, expliquer la totalité des observations. Le coût de rendu, de validation et de sérialisation explique une sensibilité possible au nombre de lignes lorsque ces chemins sont activés. Le lien causal avec des opérations ordinaires de Live reste à mesurer dans le Set concerné.

**Aucune mesure de performance dans Ableton ou Max natif n’a été réalisée pour cet audit.** Les résultats ci-dessous sont des comptages d’exécution du vrai JavaScript dans Node avec LiveAPI/Max simulés, complétés par une lecture du patch. Ils ne mesurent ni le pont LiveAPI, ni le dessin natif, ni pattr/ALS, ni les callbacks produits par les vrais objets Max. Aucune correction n’est implémentée ; les fichiers du device et la Release sont inchangés.

## Méthode reproductible

Commande : `node tests/performance/audit.cjs > validation/local/performance/counts.json`.

Le banc réutilise le faux hôte de `tests/engine.test.cjs` et charge les quatre sources de production sans les modifier. Il compte constructions LiveAPI, lectures `.get`, écritures `.set`, messages aux objets de vue, changements de boîtes, dictionnaires et appels aux fonctions. Chaque scénario a un hôte neuf ; sept passages donnent une médiane de temps Node. Les compteurs publiés correspondent au premier passage ; les chaînes de renommage/script s’allongent ensuite d’un caractère par passage. Les timers ne tournent pas en temps réel : le banc déclenche explicitement leur callback puis vide une file simulée coalescée.

Jeux : 41 pistes = contrôle MIDI + 32 MIDI gérées + 8 audio ; 1 ou 15 configurations. Charge supérieure : 60 pistes = contrôle + 51 MIDI + 8 audio, 30 configurations. Un instrument par MIDI, sauf variante avec sept effets avant l’instrument ; scripts vides, sauf variante de 8 Kio par configuration. Tous les noms sont uniques. Les configurations de rappel demandent les valeurs déjà appliquées, et une sélection Push déjà correcte.

Les lectures `.id`, `.property`, `.mode`, les notifications initiales d’observateurs, les messages natifs induits par les grilles, l’undo de Live et le coût des tâches/GC natifs ne sont pas comptés. Les temps Node instrumentés sont indicatifs ; aucun ratio de vitesse ni délai Live ne peut en être déduit.

Le scénario `recall_without_guards` neutralise les gardes uniquement dans une VM simulée pour isoler leur coût. Il ne constitue pas un correctif proposé et ne doit jamais être transposé au device.

Résultats complets : [JSON](performance-audit-2026-11-04.json). Environnement : Node v26.0.0, macOS arm64. Les 45 tests existants et le validateur source/AMXD passent.

## Mesures de volume

Messages UI = appels `.message` directs, hors changements de boîtes et hors trafic natif éventuellement induit.

| Opération | 41 pistes / 32 MIDI / 15 lignes | 60 pistes / 51 MIDI / 30 lignes |
|---|---:|---:|
| Cycle périodique, transport arrêté | 73 constructions API, 272 lectures | 111 constructions API, 405 lectures |
| Cycle périodique, clip en lecture stable | 79 constructions API, 282 lectures | 117 constructions API, 415 lectures |
| Rendu complet | 1 524 messages UI + 20 changements de boîtes | 4 042 messages UI + 20 changements de boîtes |
| Une bascule MIDI | 1 585 messages UI, 1 dictionnaire complet | 4 163 messages UI, 1 dictionnaire complet |
| Renommage d’une piste audio exclue | 147 constructions API, 271 lectures, 1 524 messages UI ; aucun dictionnaire écrit | 223 constructions API, 404 lectures, 4 042 messages UI ; aucun dictionnaire écrit |
| Rappel de valeurs déjà correctes | 1 498 constructions API, 2 998 lectures, **0 écriture API** | 3 341 constructions API, 6 665 lectures, **0 écriture API** |

Contrôles d’isolation :

- Passer de 1 à 15 lignes à pistes identiques laisse le cycle arrêté à **272 lectures**, avec **zéro message UI et zéro écriture pattr** dans le banc. Le rendu complet passe de **362 à 1 524 messages**.
- Avec sept effets avant chaque instrument, le cycle arrêté passe de 272 à **496 lectures**, sans changement de configuration.
- Un tick de disposition à taille inchangée produit **zéro lecture LiveAPI, zéro message UI et zéro dictionnaire**. Il ne faut donc pas le confondre avec une reconstruction du tableau toutes les 100 ms.
- Choisir la valeur ROOT déjà sélectionnée provoque tout de même un rendu complet : **1 599 messages UI**, sans écriture du dictionnaire grâce à la comparaison JSON.
- Une modification de script à 15 lignes envoie un dictionnaire de **6 527 octets** avec scripts initialement vides, contre **129 407 octets** avec 8 Kio de script par ligne. La validation clone aussi l’état entier.
- Dans l’isolation sans gardes, les lectures du rappel descendent de **2 998 à 358** (41 pistes), et de **6 665 à 529** (60 pistes). L’essentiel du volume API au rappel vient donc de ces gardes répétées, pas des setters.

À titre de contrôle de plausibilité, les médianes Node sont de l’ordre de 0,3–0,5 ms pour un cycle stable, 0,25–0,63 ms pour le rendu simulé et 4,5–10 ms pour un rappel déjà correct. Le faux hôte ne dessine rien et répond instantanément aux lectures : ces petites durées ne réfutent pas les secondes observées dans Live et ne permettent pas de les prédire.

## Audit par chemin

### Surveillance et inventaire

`engine.init`, `refresh`, `describe` : un Task à 2 000 ms programme `scanTask` et `clipTask`. `scanTask` appelle lui-même `checkClip` : un cycle stable effectue donc deux vérifications de clip. `refresh(false)` relit toutes les pistes et parcourt les devices MIDI **avant** de comparer la signature. Une signature identique évite réconciliation/rendu/persistance, mais pas ces accès API.

`describe` cherche la présence d’un instrument alors que `KLJModel.eligible` accepte toutes les pistes MIDI normales. Le champ `instrument` influence la signature, mais n’est pas une condition d’éligibilité ni une donnée persistée. `devices` est observé sur les pistes MIDI, y compris la piste de contrôle ; `name` sur toutes les pistes, y compris audio. Un changement de signature détache puis recrée tous ces observateurs, et redessine la vue même si aucune donnée gérée ne change. À 41 pistes : 74 observateurs de piste réarmés par inventaire modifié, en plus des observateurs globaux/clip.

Les notifications initiales lors de ces réabonnements peuvent ajouter du travail dans Max ; le banc ne les reproduit pas. Une boucle infinie d’observateurs ou une fuite mémoire n’est pas démontrée. Churn d’objets et pression GC sont des hypothèses à profiler.

### Clips et voie critique

La Gate déduplique par identité de clip en lecture ; elle ne suit pas `playing_position`. Les callbacks `is_playing`, `playing_slot_index`, `clip_slots` et `playing_status` constituent déjà une voie événementielle. `checkClip` prend un snapshot et ne rappelle que sur un démarrage reconnu. Les callbacks lisent encore LiveAPI, et `scanTask` peut les précéder dans la file basse priorité.

Chaque `recall` refait aussi un inventaire complet, puis un snapshot de confirmation. Cela protège contre des cibles périmées, mais ajoute le scan sur le chemin musical. La création d’un clip dans un slot existant, son renommage ou l’édition de notes ne sont **pas démontrés** comme déclenchant chacun un inventaire : il faut journaliser les callbacks réels. Le polling peut seulement entrer en concurrence avec ces opérations.

### Gardes et application

`guardedTrack` relit la liste des pistes, décrit la cible et recherche les doublons sur toutes les autres pistes. Il est appelé pour chaque MIDI et pour Push, avant même de savoir si `mute` devra changer. D’où un coût proche de O(M × T), même avec zéro setter.

`setIfDifferent` lit la valeur et la relit pour vérification. Cette double lecture et la vérification Push ont une raison fonctionnelle : détecter un setter refusé. Les supprimer sans diagnostic serait une régression possible. Les logs de rappel sérialisent aussi un petit bilan, à chaque rappel, mais pas toutes les deux secondes au repos. Les changements sonores effectifs ON/OFF restent un coût distinct, absent du scénario déjà correct.

### Modèle, interface et persistance

Le modèle reste simple : listes de pistes/lignes et états MIDI. Sa validation et ses copies JSON coûtent O(R × M + taille des scripts) ; `reconcile` ajoute des recherches de pistes, mais n’est pas exécuté au repos avec signature identique.

Le callback commun `changed` fait validation complète, `persist()` complet et `render()` complet. Une cellule ou un caractère de script modifié reconstruit donc les cellules de toutes les configurations et recalcule la disposition. CLIP/BPM valident en plus un candidat cloné avant ce callback. Une sélection de cellule inchangée évite généralement la persistance, mais repeint les lignes ; une sélection de menu identique n’évite pas le rendu. Le bouton JavaScript peut également passer par `changed` sans mutation musicale.

Aucun contrôle de visibilité n’empêche `view.render` lorsqu’un inventaire ou une donnée change, même si l’éditeur a été fermé. Cela démontre l’envoi des messages, pas le temps de peinture d’une fenêtre cachée. `status` recolore les lignes, y compris sur des avertissements répétés.

Le patch initialise `qmetro 100` et `mousestate poll` sans arrêt explicite lié à la fenêtre. Le premier teste la taille et quitte rapidement si elle est identique ; le second alimente les coordonnées de souris. Leur fréquence effective et leur coût fenêtre fermée demandent une vérification native. Les connexions bidirectionnelles des deux grilles et le `deferlow → refresh` ajoutent potentiellement des notifications/dessins. Il n’y a pas de preuve ici d’une rétroaction infinie ; le banc ne modélise pas les outlets natifs.

`persist` compare son JSON à `lastStored` avant d’envoyer le dictionnaire. Il **n’écrit pas le fichier ALS sur disque** : il met à jour le paramètre `pattr`, que Live sauvegarde avec le Set. Il n’envoie rien pendant un poll stable. Les échos pattr sont protégés par `saving`. Le coût natif de copie du Blob, l’état modifié du Set, l’undo et une éventuelle activité d’autosauvegarde restent à mesurer. Ne pas attribuer ces coûts à chaque cycle de deux secondes sans preuve.

### JavaScript utilisateur

Le runner compile et exécute `new Function` uniquement lorsqu’un clip reconnu porte un script non vide. Ce n’est pas une tâche périodique du moteur. Un script utilisateur peut toutefois créer ses propres Tasks/observateurs et continuer à travailler ensuite ; rien ne permet de l’exclure sans inspecter les scripts du Set concerné. Tester d’abord un clone des configurations avec scripts désactivés. Une exception synchrone capturée n’équivaut pas à l’arrêt d’une tâche asynchrone utilisateur.

## Proposition classée, sans implémentation

| Priorité | Correction proposée | Impact attendu | Complexité / risque |
|---|---|---|---|
| 1 | Inventaire événementiel, invalidation explicite et regroupement des rafales ; retirer le scan complet périodique | Fort sur le travail de fond à deux secondes | Moyenne ; risque de cibles périmées si notifications insuffisantes |
| 1 | Réserver les callbacks clips à une file courte ; supprimer les doubles vérifications et éviter un inventaire inconditionnel au rappel si le cache est à jour | Fort sur la réactivité sous charge | Moyenne ; tester lancements quantifiés et Follow Actions |
| 1 | Suspendre rendu, polling souris et disposition quand l’éditeur est fermé ; vue marquée « sale », reconstruite une fois à l’ouverture | Fort sur les éditions du Set fenêtre fermée | Faible à moyenne ; bien détecter fermeture native et vidage du texte édité |
| 2 | Mise à jour d’une cellule/ligne et des anciennes/nouvelles lignes actives ; structure complète seulement si colonnes changées | Fort sur la croissance avec les configurations | Moyenne ; préserver éditeur natif, menus et synchronisation CLIP |
| 2 | Mutualiser liste des pistes et doublons pendant un rappel, conserver les contrôles d’existence/éligibilité au moment des écritures | Très fort sur le nombre d’appels au rappel | Moyenne à élevée ; protection audio prioritaire, cache limité au rappel |
| 2 | Éviter les changements sans effet ; ne pas sérialiser/redessiner pour un simple dépliage ; validation/persistance groupées des rafales de texte | Moyen, dépend surtout de la taille des scripts | Moyenne ; ne perdre aucune dernière saisie avant rappel/sauvegarde |
| 3 | Réduire copies JSON inutiles et observer uniquement les propriétés nécessaires | Gain complémentaire | Faible à moyenne, après mesure des deux premières familles |

Le moteur devrait conserver un modèle mémoire immédiatement à jour et le même Blob/version de données. Pour la première correction, **garder la persistance actuelle** et découpler d’abord son rendu. Si la mesure montre que le Blob domine, envisager ensuite un regroupement court des saisies avec vidage garanti à la validation, au changement de ligne et avant sauvegarde. Ne pas différer pattr sans démontrer ce dernier point ; le risque de perte de dernière frappe n’est pas acceptable.

### Pertinence de REFRESH TRACKS

Oui comme resynchronisation explicite et filet de sécurité, pas comme seul mécanisme de cohérence. Architecture minimale recommandée :

1. Inventaire initial après restauration ; observer la structure des pistes et les changements de nom pertinents pour identités, numéros et ambiguïtés.
2. Notifications de structure marquent l’inventaire invalide ; une tâche dédiée regroupe les rafales. Une erreur d’inventaire conserve les données précédentes.
3. À l’ouverture : resynchronisation, puis reconstruction de la vue seulement si nécessaire. REFRESH TRACKS demande le même chemin. Un simple clic ne doit ni appliquer une configuration, ni primer/resetter la Gate d’un clip en cours.
4. Lors d’un rappel, resynchroniser si nécessaire et revalider les cibles avant écriture ; ne pas faire confiance à des index persistés. Suppressions, pistes gelées et noms ambigus restent protégés même fenêtre fermée.
5. Retirer le parcours des devices si toutes les pistes MIDI restent éligibles ; conserver les contrôles réels de type/état qui sécurisent les écritures.

La disponibilité/exhaustivité des notifications dans Live doit être vérifiée avant de supprimer le filet de sécurité. Si des notifications manquent, préférer une vérification légère des identités ou un rattrapage ciblé d’un lancement en attente, sans réintroduire un inventaire massif permanent. Une actualisation uniquement à l’ouverture serait insuffisante : les changements de structure peuvent survenir pendant le live, fenêtre fermée.

## Protocole de confirmation dans Ableton

Sur une copie du Set et dans une version diagnostique séparée, journaliser des agrégats (pas une ligne par cellule) : source de réveil, nombre/durée des scans, rappels, gardes, rendus, notifications de grille et écritures pattr ; taille des scripts ; état de fenêtre ; retard d’une petite sonde de file basse priorité. Mesurer durée médiane, p95 et maximum des actions utilisateur et des rappels. Les métriques CPU audio de Live seules ne suffisent pas pour la file UI.

Comparer séparément : device absent ; device présent inactif musicalement ; scan seul suspendu ; rendu seul neutralisé ; persistance seule neutralisée temporairement ; scripts utilisateur désactivés. Les neutralisations sont réservées au diagnostic sur copie et ne deviennent jamais des variantes utilisables sur scène. Ne pas utiliser simplement le bouton Device On comme preuve d’arrêt du JavaScript sans vérifier que les Tasks cessent réellement.

Matrice : 41/32 pistes avec 1/15/30 lignes puis 60 pistes, transport arrêté/en lecture, éditeur fermé/ouvert. Répéter création/renommage de clip, édition de notes, renommage MIDI/audio et mutations de pistes. Contrôler les callbacks réels : créer un clip n’équivaut pas nécessairement à modifier `clip_slots`.

Tester les événements séparément : quantification en attente, lancement manuel/scène/Follow Action, boucle, arrêt/reprise et deux clips au même nom. Comparer un rappel sans setter et un rappel avec beaucoup de changements. Avec les futurs correctifs : absence de scans complets au repos stable, absence de messages de grille fenêtre fermée, aucune opération proportionnelle aux autres configurations pour une cellule, et retard de rappel ne dépassant pas la référence légère dans le même Set. Fixer un seuil de p95 acceptable avec les musiciens, en tenant compte des scripts utilisateur ; aucune garantie de latence chiffrée avant ces mesures.

## Références et statut

- [LiveAPI](https://docs.cycling74.com/apiref/js/liveapi/) : initialisation et accès dans la file basse priorité.
- [Task](https://docs.cycling74.com/apiref/js/task/) : latence d’exécution variable en basse priorité.
- [jit.cellblock](https://docs.cycling74.com/reference/jit.cellblock) : synchronisation et redessin explicite.

Le partage de cette file rend la contention plausible ; il ne prouve pas l’origine du curseur macOS. Aucun test de la Release publique n’est remplacé par ces comptages. **Arrêt pour validation du diagnostic et de l’ordre des corrections.**
