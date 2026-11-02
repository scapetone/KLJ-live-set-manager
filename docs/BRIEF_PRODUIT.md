# Brief produit — KLJ Live Set Manager

> **Document de travail, version 0.1 (2026-11-02).** Ce texte rassemble les éléments exprimés et confirmés pendant le cadrage. Les choix d'interface, de moteur MIDI et de réalisation technique ne sont **pas encore validés**.

## 1. Problème à résoudre

Pendant un live de Kiss La Joue, le Set Ableton évolue au fil de scènes et de Follow Actions. Les musiciens doivent pouvoir se concentrer sur le jeu tout en retrouvant, au bon moment, les instruments et réglages appropriés. Aujourd'hui ces changements sont produits par une piste dédiée aux clips ClyphX et un fichier de macros.

Deux difficultés identifiées :
- **Maintenance :** lorsqu'une piste est ajoutée, de nombreuses macros doivent être modifiées pour gérer son état.
- **Pilotage / fiabilité :** le musicien souhaite que Push 2 soit automatiquement positionné sur le bon instrument avec une disposition de jeu adaptée, sans dépendre inutilement de mécanismes legacy.

La réduction de la consommation CPU liée aux instruments et effets inutilisés fait également partie du besoin. Ne pas confondre mute audio et suspension du calcul d'un plugin.

## 2. Contexte du Set actuel (existant, non prescriptif)

- **8 pistes audio de stems**, en deux decks A/B de 4 pistes : kick, drums, bass, instruments ; elles permettent les mashups, superpositions et transitions. Leur **volume et leur Mute sont pilotés manuellement par un contrôleur APC** : aucune automatisation de leur mixage n'est demandée au plugin (D-018).
- **1 piste dédiée au déclenchement ClyphX**, contenant des clips nommés pour rappeler des configurations ou réaliser des actions ponctuelles.
- **Pistes MIDI d'instruments** dédiées à un clavier MIDI et à Push 2. Chaque piste dispose de son instrument. Un morceau (**Breathe**) requiert deux instruments simultanés pour le clavier.
- Ancienne **piste 10 d'entrée basse/guitare** : non nécessaire à terme, car l'instrument est branché directement sur la console de mixage.
- Le fichier `Macros.txt` fourni comporte des réglages de tempo, mute/monitoring MIDI, sélection de piste, réglages Push et activation d'un device. Il décrit le fonctionnement historique, **pas une implémentation à copier**.
- Dans les macros existantes, les commandes de pistes utilisent principalement `MUTE` et `MON`, **pas `ARM`** : monitoring, mute et armement doivent être distingués lors du cadrage.

### Deux musiciens MIDI : rôles distincts (D-020 / D-021)

**Musicien au clavier externe :**
- Le `MIDI From` de chaque piste concernée est affecté au clavier dans Live, selon le routage établi pour le concert.
- Lorsque plusieurs instruments clavier sont nécessaires, plusieurs pistes peuvent être actives simultanément (ex. Breathe).
- Le jeu dépend de la réception MIDI (monitoring `IN`) et de l'activateur de piste ; la sélection visuelle de la piste n'est pas nécessaire.
- Le plugin ne doit pas exiger de commande `ARM` pour passer d'un instrument à l'autre.

**Musicien au Push 2 :**
- La configuration active la piste MIDI devant être jouée **et sélectionne cette piste dans Live** (équivalent de `14/SEL` dans le cas `HOW_DARE_YOU_A`).
- Push suit la piste sélectionnée pour l'accès à l'instrument ; ses modes de jeu, fondamentale, gamme et réglages avancés sont des paramètres supplémentaires distincts.
- Le monitoring `IN` est présent dans les macros de référence ; il faut tester le résultat réel avec Push 2, notamment l'auto-armement natif lors de la sélection.
- **Aucun moteur d'armement explicite n'est demandé en V1** sur la base du fonctionnement observé.

**Exemple fonctionnel issu de `HOW_DARE_YOU_A` :** pistes 11 et 14 activées et en monitoring `IN`, piste 14 sélectionnée pour Push, tempo 120 et gamme de Do mineur. Les commandes de mode/scale Push sont des souhaits complémentaires, dont le support sans legacy reste à vérifier.

**D-022 — simplification envisagée (à confirmer par test dans le Set réel) :** configurer une fois `Monitor IN` sur les pistes MIDI de jeu, ainsi que leur `MIDI From` propre à chaque contrôleur. Le plugin gère uniquement l'état Track Activator et la sélection de piste Push, sans automatiser les commandes `MON OFF / MON IN` historiques de ClyphX.

**Justification :** Live 12 indique que Monitor IN transmet en permanence l'entrée indépendamment de l'armement. **Attention :** Monitor IN supprime la lecture des clips MIDI hébergés sur ces pistes ; acceptable uniquement pour les pistes employées comme instruments joués en direct.

**Information confirmée sur le Set KLJ :** aucune piste MIDI d'instrument ne contient actuellement de clip MIDI. Le conflit entre Monitor IN et la lecture de clips MIDI n'est donc pas un problème pour l'usage actuel. Cela ne valide pas encore la distribution du MIDI de Push vers une seule piste lorsque plusieurs pistes sont sur Monitor IN.

**Critère de vérification avant gel des specs :** lorsque plusieurs pistes MIDI sont sur Monitor IN, le clavier doit jouer seulement ses instruments actifs et Push doit jouer seulement la piste visée (y compris quand elle est sélectionnée via l'API, pas manuellement sur Push). Tester aussi deux pistes clavier actives en parallèle et les transitions par Follow Actions. Si le test échoue, réévaluer la gestion du monitoring sans réintroduire tout le reset global de ClyphX. Le routage `MIDI From` est pour l'instant préparé manuellement.

Sources officielles : https://www.ableton.com/en/live-manual/12/routing-and-i-o/ et https://www.ableton.com/en/manual/using-push-2/.


## 3. Progression musicale — mécanisme existant à préserver

Le musicien déclenche principalement une **scène entière** en avançant dans Session View.

Le Set alterne :
1. **Passages avec progression automatique :** les clips avancent via des Follow Actions, y compris sur la piste de contrôle ; la configuration instrumentale suit ces événements pendant que le musicien joue.
2. **Passages de boucle / improvisation :** le live reste sur une boucle aussi longtemps que nécessaire, pour improviser ou préparer un changement d'instrument physique.
3. **Relance manuelle :** le musicien lance une nouvelle scène au moment choisi, ce qui peut démarrer une nouvelle progression automatique.

Les Follow Actions sont configurées et synchronisées dans Live. **Le gestionnaire n'a pas à remplacer ce moteur de progression.**

Les changements de configuration MIDI ne coïncident pas nécessairement avec l'entrée des premiers stems du morceau suivant. Plusieurs configurations peuvent exister dans un même morceau (ex. `TRUE_PEAK_A` / `TRUE_PEAK_B`), et des déclencheurs peuvent être répétés.

## 4. Principe fonctionnel confirmé

**Un clip déclencheur lu sur une piste dédiée => application de la configuration associée à son nom.**

- Déclenchement manuel par lancement d'une scène **ou** automatique par Follow Action : même comportement.
- Plusieurs clips peuvent invoquer la même configuration.
- Plusieurs configurations peuvent exister au sein d'un même morceau.
- Un changement qui ne concerne que le tempo se prépare en **dupliquant une configuration complète** et en changeant son BPM ; pas de mode ponctuel distinct (D-012).
- Les scènes, stems et Follow Actions restent gérés nativement par Ableton.

**D-012 — Mode unique de configuration complète :** chaque clip applique l'état prévu par sa ligne de configuration. **D-014 :** les pistes audio et MIDI figurent dans le tableau. **D-019 :** le bouton ON/OFF de piste doit piloter **Track Activator**, et non Device On/Off. Pour le Set KLJ, ne pas modifier le mixage manuel des stems audio effectué sur APC (D-018). L'interface devra offrir une duplication rapide des configurations ; à l'exécution, éviter les actions redondantes sera étudié pour préserver la continuité audio. Le périmètre précis, le format des noms et la sauvegarde restent à définir.

## 5. Besoins exprimés à prendre en charge

### P0 — Besoin central

- Configurer automatiquement le **bon instrument joué depuis Push 2** à chaque déclenchement concerné.
- Configurer le ou les **instruments joués depuis le clavier MIDI**, y compris le cas où deux pistes doivent jouer en parallèle.
- Préserver la progression musicale et les transitions A/B. Les pistes audio peuvent figurer dans le tableau pour les opérations Device ON/OFF, mais le device ne gère ni leur volume ni leur Mute (D-018).
- Permettre une progression autonome lors des Follow Actions tout en gardant la reprise en main par lancement manuel de scène.

### Besoins importants, détail à préciser

- **Push 2 — choix V1 validé (option B) :** sélection automatique du bon instrument / de la piste jouée **indispensable** ; modes avancés, disposition « 64 pads » et personnalisation d'affichage **souhaitables, non bloquants et conditionnés à une faisabilité confirmée** sur Live 12/Push 2. Les réglages de gamme/fondamentale restent à détailler dans le catalogue des actions. La sélection seule doit avoir un comportement utile même si les modes avancés ne sont pas réalisables.
- **Tempo et réglages musicaux :** actions globales ou attachées à une configuration, y compris paliers de tempo pendant une transition.
- **Effets et devices :** possibilité de les activer/désactiver à certains moments d'un morceau.
- **Gestion des pistes inutilisées (D-011, précisée par D-019) :** les états ON/OFF des pistes dans chaque configuration sont appliqués automatiquement quand le clip correspondant démarre. Pour cette commande, on utilise **Track Activator**. L'économie CPU réelle reste à tester ; on ne présume plus que le device désactive automatiquement les plugins pour y parvenir. La priorité reste une réalisation simple pour KLJ.
  - **D-019 :** la commande ON/OFF principale actionne l'**activateur de piste**. Dans l'API Live (Max for Live), cela correspond à `Track.mute` : `mute = 1` désactive la piste et `mute = 0` l'active. Référence : https://docs.cycling74.com/userguide/m4l/live_api/
  - **Limite CPU :** activer/désactiver une piste ne garantit pas l'arrêt du calcul de tous ses devices. La baisse CPU est un objectif à mesurer sur le Live Set réel, et non une promesse de la V1. La commande distincte `Device On/Off` permet, elle, d'arrêter le traitement d'un device : https://www.ableton.com/en/manual/working-with-instruments-and-effects/
  - **Non décidé :** quels devices d'une piste sont concernés ; comment déterminer qu'un instrument est inutilisé ; faut-il un délai, une exception ou une préactivation avant le jeu.
  - **Contrainte :** ne pas assimiler `Track.mute` à une économie CPU garantie ; ne pas arrêter automatiquement les stems ou d'autres traitements non concernés.
  - **Validation requise :** mesures de charge, temps de réactivation, notes tenues/queues d'effets et transitions dans Ableton réel.
- **Maintenance :** lorsqu'une piste apparaît dans Live, ajouter une colonne au tableau ; l'utilisateur configure ses états ligne par ligne sans modifier de macros.
- **Interface :** tableau de configurations complètes associé aux noms de clips, duplication simple, colonnes de pistes audio/MIDI, sélection de la piste jouée par Push. Pas de colonne d'armement explicite requise pour KLJ en V1 (D-021).

Ces besoins ne constituent **pas encore** le périmètre ferme de la V1.

## 6. Contraintes et critères d'évaluation

- **Fiabilité scénique :** comportement prévisible et absence de changements intempestifs pendant les transitions.
- **Simplicité de maintenance :** ajout d'instruments et de morceaux sans modifications répétitives.
- **Compatibilité avec la Session View actuelle :** conserver les clips et Follow Actions.
- **Contrôle clair :** différencier choix de l'instrument, routage/monitoring MIDI, mute, armement, activation de device et sélection visuelle.
- **Réactivité :** les changements doivent intervenir suffisamment vite pour ne pas gêner le jeu. Les timings acceptables restent à mesurer.
- **Robustesse :** comportement lors d'une relance du même clip, d'une piste absente et d'un changement de structure à définir.

## 7. Priorité KLJ et matrice de pistes — décisions D-013 à D-016

**La V1 vise exclusivement le besoin du live KLJ, avec une livraison la plus rapide possible.** Une utilisation par d'autres musiciens reste un bonus, pas une exigence produit. On n'ajoute pas de systèmes génériques si cela ralentit la livraison.

### Modèle d'interface validé

- Une **ligne** représente une configuration complète correspondant à un nom de clip déclencheur.
- Une **colonne** représente une piste du Set Ableton, **audio ou MIDI**.
- Le tableau peut représenter une piste audio ou MIDI. L'état ON/OFF principal correspond toujours au **Track Activator**. Sur le Set KLJ, les pistes de stems audio ne doivent pas être commutées automatiquement par cet outil, car leur mixage reste manuel via APC.
- **Armement :** pas de commande d'armement explicite requise en V1 (D-021). Si cette fonction devait être ajoutée ultérieurement, elle concernerait uniquement les pistes MIDI (D-015).
- Une nouvelle piste ajoutée à Ableton doit produire **une nouvelle colonne** dans le tableau. L'utilisateur renseigne ensuite les valeurs pour chaque configuration existante, sans modifier manuellement des macros.
- Tempo, fondamentale/gamme, sélection Push et états spécifiques de devices doivent aussi être représentables dans les configurations, selon une mise en page à concevoir.

**D-019 — activation des pistes :** utiliser précisément le **Track Activator de Live** pour l'état ON/OFF principal d'une colonne. Ne pas confondre cette commande avec l'activation individuelle d'un synthétiseur ou d'un effet. Les éventuels réglages de devices (ex. True Peak) sont des contrôles séparés.

**D-018 — mixage audio externe au device :** les volumes et le Mute des stems sont gérés manuellement avec un contrôleur APC. Aucune commande de volume/Mute des pistes audio dans la V1 ; la possibilité de contrôler leurs effets via Device ON/OFF reste distincte.

**À définir :** quels effets doivent être pilotables séparément (ex. True Peak) ? Quelle valeur initiale pour les nouvelles cellules ? Comment mesurer l'effet CPU réel de Track Activator, et faut-il une optimisation supplémentaire sans complexifier la V1 ?

### Organisation de l'interface — D-023 validée

**Deux niveaux d'édition :**

1. **Tableau principal :** une ligne par configuration complète liée à un nom de clip, avec des colonnes immédiatement utiles pour comparer les configurations KLJ : BPM, états ON/OFF des pistes d'instruments MIDI, piste sélectionnée pour Push. L'utilisateur doit pouvoir repérer les changements d'instruments d'un seul coup d'œil.
2. **Panneau de détails de la ligne sélectionnée :** édition des paramètres plus rares ou spécifiques : fondamentale, gamme, In Key, modes Push conditionnés à leur faisabilité, actions individuelles sur certains effets (exemple True Peak).
3. **Édition rapide :** la duplication d'une ligne permet de préparer une variation d'un même morceau en modifiant un BPM, un instrument ou un effet. Une nouvelle piste crée une colonne à renseigner dans les configurations.

**Important :** cette validation concerne l'organisation « tableau + panneau », pas une disposition graphique pixel par pixel ni une exclusion générale des pistes audio. Les stems étant contrôlés manuellement par APC (D-018), ils n'ont pas besoin d'encombrer la vue compacte ; la représentation éventuelle des pistes audio, des effets qui s'y trouvent et du filtre de colonnes reste à préciser. Aucune commande Mute ou volume des stems ne doit être exécutée par ce device.

**D-024 — valeur initiale validée :** à l'ajout d'une nouvelle piste MIDI d'instrument, créer automatiquement sa colonne et préremplir ses cellules **OFF pour toutes les configurations existantes**. Le musicien active ensuite la piste dans les configurations souhaitées. C'est l'état cible enregistré pour les futurs déclenchements, pas une commande immédiate imposée à la piste physique lors de son ajout. La gestion des renommages et suppressions reste à préciser.

### Faisabilité des effets spécifiques — cas True Peak (vérification documentaire)

**Faisable avec l'API officielle Max for Live :** une configuration peut agir sur le paramètre automatable `Device On` d'un device chargé dans une autre piste Live, pour reproduire la logique de `16/DEV(3) OFF` puis `16/DEV(3) ON` de ClyphX.

- Via le Live Object Model, parcourir les `Track.devices`, identifier le device de la piste ciblée, retrouver son paramètre **Device On**, puis modifier `DeviceParameter.value` avec `live.object` ou `LiveAPI` JavaScript.
- Ne pas tenter d'écrire directement `Device.is_active` : la propriété est **en lecture seule** et sert à connaître l'état effectif, y compris lorsqu'un rack parent est désactivé.
- **D-025 :** ne pas développer d'éditeur graphique spécialisé pour ce cas. Chaque configuration dispose plutôt d'un **champ texte « Commandes avancées / Script »**, facultatif, exécuté lors du lancement de son clip, en complément de l'état complet défini dans la grille. La syntaxe finale n'est pas encore définie. L'exemple historique `16/DEV(3) OFF` illustre l'effet voulu, mais n'est **pas encore garanti comme syntaxe directement acceptée** par le futur device.
- La configuration doit respecter les états de l'effet prévus par chaque ligne sans redémarrer inutilement un effet déjà à la bonne valeur.
- **Limites à vérifier sur les devices réels :** disponibilité du paramètre Device On sur l'effet concerné, devices imbriqués dans des racks, automation concurrente éventuelle et coupure de queues de reverb/delay à la désactivation.

**Important :** ce constat valide la **faisabilité de l'action via Live API**, pas la compatibilité avec la syntaxe historique de ClyphX ni la possibilité d'exécuter sans contraintes n'importe quel code fourni par l'utilisateur. L'activation de **l'effet** est distincte de l'activation de **la piste** (D-019).

Références officielles :
- [Cycling '74 — Live API](https://docs.cycling74.com/userguide/m4l/live_api/)
- [Cycling '74 — Device et paramètres](https://docs.cycling74.com/apiref/lom/device/)
- [Cycling '74 — DeviceParameter.value](https://docs.cycling74.com/apiref/lom/deviceparameter/)
- [Ableton Live 12 — Activateur des devices](https://www.ableton.com/en/manual/working-with-instruments-and-effects/)

### Commandes avancées — champ libre par configuration (D-025)

- Le panneau de détails comporte un champ de texte, éventuellement multiligne, **facultatif**, propre à chaque configuration.
- Le contenu est lancé **lorsque le clip associé démarre** (déclenchement de scène manuel ou Follow Action), conjointement aux réglages standards de la configuration.
- Usage visé : commandes spécialisées peu fréquentes, comme le basculement de l'effet n° 3 de la piste 16 entre True Peak A et B, sans ajouter un nouvel élément graphique au tableau.
- **Non tranché :** langage retenu et API exposée (petit langage de commandes, forme proche de ClyphX, ou JavaScript avec accès aux commandes Live), ordre exact par rapport au snapshot, niveau de liberté, validation syntaxique, feedback d'erreur, tolérance aux modifications du Set.
- **Principe de fiabilité attendu :** une erreur dans le champ personnalisé ne doit pas faire planter le device ni bloquer la progression musicale. Éviter d'exécuter aveuglément du code incontrôlé sans mécanisme de diagnostic.
- On ne prévoit pas de reproduire intégralement le moteur ClyphX ni de construire un éditeur graphique pour chaque commande exceptionnelle.

**Piste technique, pas architecture validée :** Max propose un moteur JavaScript V8 et une API JavaScript LiveAPI. Ces briques rendent envisageable un champ de script avancé, mais son mode d'évaluation et ses contraintes doivent être spécifiés/testés avant Codex.

Documentation : https://docs.cycling74.com/reference/v8/ ; https://docs.cycling74.com/apiref/js/liveapi/

### Cas d'usage de référence

Le Set KLJ comporte huit pistes audio de stems A/B, une piste de déclenchement et des pistes MIDI dédiées au clavier et à Push. Cette organisation sert de référence à la V1 ; il n'est pas demandé de développer une architecture multi-projets générique.

## 8. Cible de livraison pour Codex

L'objectif est de finaliser **ensemble** un brief assez précis (comportements, interface, limites techniques, cas tests et critères d'acceptation) pour le transmettre à Codex en mode Plan, puis **viser** une première implémentation de bout en bout.

Cette intention n'implique pas que le code sera garanti correct sans validation dans Live : l'intégration du Push 2, le routage MIDI et les performances doivent faire l'objet de tests réels.

## 9. Hors périmètre décidé à ce jour

- Refaire le séquencement musical, les Follow Actions ou la gestion des scènes.
- Développer une IA exécutée pendant le concert.
- Reproduire à l'identique toutes les commandes et les conventions du fichier ClyphX.

**Aucune architecture d'implémentation (JavaScript, jit.cellblock, pattrstorage, Instrument Racks, etc.) n'est encore choisie.**

Voir [Décisions](DECISIONS.md) et [Questions ouvertes](QUESTIONS_OUVERTES.md).
