# Étude de faisabilité — JavaScript utilisateur par configuration

**Date : 2026-11-02**  
**Périmètre :** demande KLJ, décision D-026.  
**Statut :** faisabilité globale **fortement étayée par documentation**, mécanisme précis **non testé dans un Max for Live réel**.

## Question à résoudre

Peut-on saisir des instructions JavaScript ordinaires dans le panneau de détails d'une configuration, les enregistrer dans le Live Set et les exécuter quand le clip de cette configuration démarre, avec accès à l'API Live ?

**Le produit ne doit PAS inventer un langage de commandes ni une surcouche comparable à ClyphX.**

## Ce que les sources permettent de confirmer

### 1. JavaScript moderne dans Max

L'objet `v8` de Max 9 exécute du JavaScript moderne (ECMAScript 6+). Il existe aussi `v8.codebox`, un éditeur de code *exécutable* directement dans un patch Max. La référence de `v8` décrit des messages `compile`, mais pas un message officiel `eval <source>` pour envoyer du code arbitraire à l'objet.

**Sources :**
- https://docs.cycling74.com/reference/v8/
- https://docs.cycling74.com/reference/v8.codebox
- https://docs.cycling74.com/userguide/javascript/
- https://cycling74.com/releases/max/9.0.0

### 2. API Live accessible en JavaScript

L'objet JavaScript `LiveAPI` donne accès au Live Object Model (pistes, devices, paramètres). Il ne faut pas l'appeler depuis du code exécuté au chargement global du script avant l'initialisation du device : attendre `live.thisdevice`. Le moteur JS et les appels Live API sont exécutés en priorité basse et ne doivent pas être utilisés comme un processus audio temps réel.

**Sources :**
- https://docs.cycling74.com/apiref/js/liveapi/
- https://docs.cycling74.com/userguide/javascript/

### 3. Éditeur texte intégré au device

L'objet `text.codebox` est un éditeur de texte distinct de `v8.codebox`. Il accepte une coloration JavaScript (`@syntax .js`) et une édition en patch verrouillé (`@editlocked 1`), et peut émettre le texte comme une chaîne. `textedit` est une alternative classique.

**Sources :**
- https://docs.cycling74.com/reference/text.codebox
- https://docs.cycling74.com/reference/textedit/

**Proposition :** utiliser `text.codebox` (ou, si besoin, `textedit`) pour **modifier** le texte d'un script de configuration, et un moteur `v8` pour **l'exécuter**. Il ne faut pas confondre ces deux responsabilités.

### 4. Sauvegarde dans le Live Set

La documentation Cycling '74 indique qu'en Max for Live, les objets Max non natifs Live nécessitent un stockage adapté : `pattr` avec `@parameter_enable 1` et visibilité de stockage, ou `pattrstorage` activé en Parameter Mode pour sauvegarder son état entier dans le Live Set sans fichier JSON externe.

Les forums confirment des cas concrets de sauvegarde de texte et d'objets JavaScript via `textedit`/`pattr`, avec des précautions sur les chaînes multilignes, l'échappement des guillemets et les rappels de presets.

**Sources :**
- https://docs.cycling74.com/userguide/pattr/
- https://docs.cycling74.com/userguide/m4l/live_limitations/
- https://cycling74.com/forums/how-to-save-javascript-object-to-max-for-live-preset-using-pattr
- https://cycling74.com/forums/storing-textedit-object-in-m4l-patch
- https://cycling74.com/forums/how-do-i-save-typed-text-in-the-text-edit-object
- https://cycling74.com/forums/textedit-adds-quotes-around-text-that-contains-space-how-to-avoid-this

**Proposition :** les scripts de toutes les configurations sont des chaînes dans les données de configuration, sauvegardées avec les autres réglages via un mécanisme de stockage M4L compatible Live. Ne pas générer un fichier JS extérieur par configuration.

### 5. Évaluation dynamique d'une chaîne JavaScript

- Le standard JavaScript inclut `eval(source)` et `new Function(source)`. Les objets `v8` acceptent le langage ES6+.
- Des discussions sur les forums Cycling '74 évoquent `eval()` dans Max et dans des projets v8 ; elles ne démontrent **pas explicitement** toute la chaîne « champ utilisateur -> `eval` en `v8` -> `LiveAPI` -> sauvegarde/réouverture d'un .amxd ».
- La documentation officielle de l'objet `v8` ne décrit **pas** une commande d'entrée `eval <texte>` native de l'objet. Il faut envisager `eval` ou `Function` **à l'intérieur d'une fonction JavaScript dans `v8`**, après réception de la chaîne.
- En raison du contexte réel et de la fiabilité requise, la disponibilité et le comportement exacts de ces méthodes **doivent être confirmés par un test minimal dans la version de Max embarquée par Ableton Live 12**.

**Sources forum :**
- https://cycling74.com/forums/more-than-one-parameter-in-a-jsuiv8ui
- https://cycling74.com/forums/js-object-loading-javascript-files-in-subdirectory

## Architecture candidate (NON encore validée par exécution)

1. Le tableau sélectionne une configuration.
2. Son texte JavaScript est chargé dans `text.codebox` (avec coloration JS), puis enregistré en données de configuration.
3. Le clip déclencheur démarre. Le gestionnaire applique l'état standard de la ligne.
4. Le gestionnaire transmet le texte du script au moteur `v8` **après** l'application de l'état standard (orientation proposée, pas encore validée par l'utilisateur).
5. Le moteur `v8` essaie une évaluation via l'API JavaScript native et permet à ce code d'appeler `LiveAPI`.
6. Les erreurs de syntaxe ou d'exécution sont capturées et journalisées ; elles ne doivent pas empêcher les Follow Actions ou les clips audio de progresser.

**Ne pas faire :** réécrire un interpréteur ClyphX, imposer un DSL, créer une liste de fonctions propres à KLJ pour remplacer l'accès JavaScript natif, modifier physiquement le code source du patch à chaque clip, utiliser Node.js comme substitut direct de LiveAPI.

## Test minimal demandé à Codex avant implémentation complète (bloquant)

Dans un device MIDI Max for Live jetable, avec la version Max réellement utilisée par KLJ :

1. Créer une zone de texte multiligne `text.codebox` ou `textedit`, éditable en mode verrouillé.
2. Transmettre son contenu à un `v8` contenant une fonction de réception de chaîne.
3. Tester l'évaluation de JavaScript fourni dynamiquement, **sans fichier JS temporaire**, via `eval(source)` ou `new Function(source)`.
4. Dans ce code, créer un `LiveAPI("live_set")` **après initialisation du device** et modifier un paramètre bénin, par exemple le tempo, sur un Set de test. Tester également une commande `Device On` sur un device d'essai.
5. Tester plusieurs lignes, la répétition d'une même ligne, une instruction JavaScript invalide, et vérifier que les événements suivants restent opérationnels.
6. Enregistrer le Live Set, le fermer et le rouvrir ; confirmer que les sources JS de **plusieurs configurations** sont intactes, y compris retours à la ligne, guillemets, points-virgules et caractères accentués.
7. Confirmer la bonne séquence d'exécution après les actions standards et l'absence de recompile/redémarrage intempestif du patch.

**Critère de réussite :** les scripts éditables sont réellement exécutés via `LiveAPI` et rappelés depuis le Set, sans construction de fichiers externes ni grammaire propriétaire.

**Si `eval`/`Function` est bloqué en v8 :** ne PAS inventer une pseudo-syntaxe à la place. Examiner la possibilité d'injection/programme via `v8`/codebox propre à Max et présenter la limitation pour arbitrage avant de poursuivre.

## Risques à maîtriser

- JavaScript exécuté dans Max est en priorité basse : pas de garantie d'exécution à l'échantillon près.
- Un script erroné peut provoquer une exception ; `try/catch` ne protège **pas** d'une boucle infinie ou d'un script qui bloque le thread.
- Ne charger/exécuter que des scripts écrits et compris par les musiciens pour ce Live Set. Un champ JS libre a les droits de l'environnement Max ; il ne constitue pas un bac à sable de sécurité.
- Les modifications via `LiveAPI` doivent être effectuées au bon moment de l'initialisation et dans le contexte d'exécution autorisé.
- Sur scène, éviter le rechargement/recompilation du device entier à chaque déclencheur.

## Conclusion

**Avis : faisable en principe avec les composants standards de Max 9, sans langage propriétaire, mais pas encore « prouvé sur matériel » pour la chaîne complète.** Il reste **un test ciblé indispensable** sur l'évaluation dynamique en `v8` avec `LiveAPI` dans le contexte réel d'un Max for Live embarqué.

Une fois ce test réussi, le reste relève du câblage du tableau, de la sauvegarde et des diagnostics habituels.
