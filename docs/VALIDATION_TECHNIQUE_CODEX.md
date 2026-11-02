# Validation technique courte avant Codex — KLJ Live Set Manager

**Date : 2026-11-02**  
**Objectif :** lever les risques réellement bloquants avant la V1, sans inventer une architecture universelle ni multiplier les tests.

> **Important :** les points « API disponible » sont étayés par la documentation, mais **aucun test n'a encore été réalisé ici dans Ableton Live 12 avec le Push 2 KLJ**. Ce document n'est pas un compte rendu d'essais réussis.

## Résumé des API vérifiées

| Besoin KLJ | API officielle documentée | Statut |
|---|---|---|
| Trouver la piste du device installé | `this_device canonical_parent` | API disponible |
| Voir le clip actuellement joué sur la piste | `Track.playing_slot_index`, `Clip.playing_status`, `Track.fired_slot_index` | API disponible, événements limites à tester |
| Sélectionner la piste jouée par Push | `Song.View.selected_track` (get/set/observe) | API disponible ; comportement matériel Push 2 à tester |
| Diagnostiquer l'armement implicite de Push | `Track.implicit_arm` (get/set/observe), `Track.arm` | API disponible ; **ne pas ajouter une commande ARM en V1 sans besoin démontré** |
| Tempo, fondamentale, gamme | `Song.tempo`, `Song.root_note`, `Song.scale_name`, `Song.scale_mode` | API disponible ; synchronisation de la disposition Push à vérifier |
| Activer/désactiver les instruments MIDI | `Track.mute` (`0` = Track Activator ON, `1` = OFF) | API disponible ; aucun contrôle Mute/volume des 8 stems APC |
| Récupérer noms et ordre des pistes | `Song.tracks` et `Track.name` (observable) | API disponible ; suivre les renommages sans viser une piste homonyme |
| Script par configuration | `text.codebox` + moteur `v8` + `LiveAPI` | Éléments disponibles ; **évaluation dynamique d'une chaîne et sauvegarde à prouver** |

## Les trois essais prioritaires

### P1 — Événements de lancement sans redéclencher les boucles

**Préparation :** créer un device de test sur **la piste de clips déclencheurs**, avec 3–4 clips nommés, un compteur de déclenchements et un journal des événements API (`playing_slot_index`, `fired_slot_index`, `playing_status`, etc.). Ne pas se baser uniquement sur `playing_position` : cette propriété revient au début lors d'une boucle naturelle.

**Cas à exécuter :**

1. Lancer manuellement un clip : **1 déclenchement** au début effectif.
2. Le laisser boucler 4 fois : **0 nouveau déclenchement**.
3. Configurer une Follow Action *Linked* après plusieurs tours : **0 nouveau déclenchement** pendant l'attente ; **1 déclenchement** à l'arrivée du clip suivant.
4. Enchaîner deux clips distincts au **même nom** : **1 déclenchement par lancement**.
5. Tester *Play Again* et relance manuelle du **même slot** : distinguer un vrai redémarrage d'une boucle, ou documenter précisément la limitation API.

**Réussite :** comportement prévisible dans ces cas, sans double déclenchement et sans script exécuté une fois par tour de boucle. **Risque explicite :** `playing_slot_index` seul ne change pas lors d'une relance du même slot. Ne pas prétendre couvrir le cas 5 sans résultat réel.

### P2 — Sélection Push 2 et monitoring IN

**Préparation :** créer une piste contrôleur et trois instruments : au moins une piste clavier dédiée au Vortex, deux instruments potentiels pour Push. Le clavier a un `MIDI From` fixe ; les pistes instrumentales concernées sont sur `Monitor IN`, selon D-022. Le Set ne contient actuellement aucun clip MIDI instrumental.

**Cas à exécuter :**

1. Basculer `Song.View.selected_track` de Push-A vers Push-B depuis Max for Live ; vérifier que Push 2 suit la sélection et ne joue **que** le bon instrument.
2. Vérifier `Track.implicit_arm` et `Track.arm` avant et après la sélection, **sans imposer leur modification** en première approche.
3. Clavier : deux instruments actifs simultanément doivent jouer depuis le clavier, sans faire jouer un instrument réservé à Push.
4. Modifier `Song.root_note` / `Song.scale_name` / `Song.scale_mode` : vérifier le rendu **sur les pads Push**, pas seulement l'affichage Live.
5. Option seulement si facile : vérifier disposition Note / 64 pads / In Key via le comportement natif ; **ne pas installer d'ancien script Push legacy ni bloquer la V1 sur 64 pads**.

**Réussite :** sélection fiable et correcte des instruments joués par les deux musiciens, sans manipulations manuelles supplémentaires au changement de configuration. Si sélection API + Monitor IN ne suffisent pas, documenter exactement ce qui manque avant d'ajouter une action d'armement ou de monitoring.

### P3 — Exécuter et sauvegarder du JavaScript libre

**Préparation :** créer dans un device jetable un champ de texte multiligne éditable en mode verrouillé (`text.codebox` ou `textedit`), une structure de données de plusieurs configurations et un moteur JavaScript `v8`.

**Cas à exécuter :**

1. Envoyer une **chaîne JS arbitraire** d'une configuration au moteur et la faire exécuter **sans fichier externe et sans langage de commandes propriétaire**.
2. Depuis ce script et **après l'initialisation de LiveAPI**, changer un tempo dans un Set de test.
3. Tester une action sur un paramètre `Device On` (référence True Peak) d'un device d'essai.
4. Utiliser deux scripts différents, répéter un lancement, puis injecter une erreur de syntaxe et une erreur d'exécution ; vérifier que le moteur **signale l'erreur** et accepte le déclenchement suivant.
5. Sauvegarder le Live Set, quitter Live, rouvrir : comparer tous les scripts (retours à la ligne, accents, guillemets) et leurs réglages. Pas de `.js` par morceau ni de `.json` externe.

**Réussite :** une instruction JS native appelle `LiveAPI`, est persistée dans l'ALS et n'empêche pas les changements ultérieurs en cas d'erreur. Une boucle infinie ne peut pas être neutralisée par un simple `try/catch` : les scripts sont assumés **fiables et écrits par l'utilisateur**, non traités comme code tiers arbitraire.

Voir l'[étude dédiée](FAISABILITE_SCRIPTS_JS.md) pour les références et alternatives.

## Essai de non-régression après les trois POC

Faire un mini Set KLJ représentatif (8 stems protégés, 1 piste déclencheur, 2 instruments clavier, 2 Push) et tester :

- Deux configurations de type `HOW_DARE_YOU_A/B` avec états MIDI/tempo/Push différents.
- `TRUE_PEAK_A/B` avec script de basculement de l'effet, exécuté **après** la configuration standard (**ordre proposé à faire valider**, pas encore décision formelle).
- Les faders et boutons APC continuent de gérer seuls les stems : **aucun volume, aucun Track Activator audio modifié par le device**.
- Ajout d'un instrument MIDI : nouvelle colonne OFF ; déplacement : le numéro/ordre visuel suit Live sans permutation d'états ; renommage en session : correspondance maintenue ; suppression : colonne et données supprimées, pas de « piste fantôme ».
- Deux noms de piste instrument identiques : avertissement simple, jamais de commande dirigée arbitrairement vers la mauvaise piste.
- Fermer/rouvrir le Set et reproduire la même succession de clips.
- Contrôler l'absence de craquement, de son bloqué et de redémarrage de Push au fil de plusieurs changements.

## Points à ne pas ajouter sans preuve de besoin

- Nouvelle syntaxe ClyphX, DSL, moteur de commandes clé en main ou GUI spéciale pour True Peak.
- Réécriture du monitoring MIDI à chaque scène alors qu'il est préconfiguré dans Live.
- ARM général, gestion du CPU par bypass forcé de tous les synthés, ou promesse de gain CPU avec `Track.mute`.
- Remplacement des Follow Actions natives, sauvegarde externe au projet, restauration de pistes supprimées.
- Dépendance à un Remote Script Push 2 legacy pour la V1.
- Architecture universelle multi-sets non demandée.

## Ordre de travail recommandé à Codex

1. Lire [brief produit](BRIEF_PRODUIT.md), [décisions](DECISIONS.md), [étude JS](FAISABILITE_SCRIPTS_JS.md) et ce document.
2. Proposer en **mode Plan** une architecture Max for Live minimale et signaler les incompatibilités réelles.
3. **Effectuer P1/P2/P3 avec un patch de test minimal**, ou préparer les patchs et fournir un protocole exact lorsque les essais exigent le matériel Live/Push de l'utilisateur. **Ne pas déclarer ces tests réussis sans Live**.
4. Construire la V1 suivant les décisions validées, puis faire les essais de non-régression dans le vrai Set.
5. Réviser uniquement les points qui échouent sur le matériel ; ne pas réintroduire un framework abstrait.

## Références officielles

- [Cycling '74 — Live API Overview](https://docs.cycling74.com/userguide/m4l/live_api_overview/)
- [Cycling '74 — Song.View](https://docs.cycling74.com/apiref/lom/song_view/)
- [Cycling '74 — Song](https://docs.cycling74.com/apiref/lom/song/)
- [Cycling '74 — Track](https://docs.cycling74.com/apiref/lom/track/)
- [Cycling '74 — Clip](https://docs.cycling74.com/apiref/lom/clip/)
- [Cycling '74 — ClipSlot](https://docs.cycling74.com/apiref/lom/clipslot/)
- [Cycling '74 — v8](https://docs.cycling74.com/reference/v8/)
- [Cycling '74 — text.codebox](https://docs.cycling74.com/reference/text.codebox)
- [Ableton — Push 2 Live 12](https://www.ableton.com/en/manual/using-push-2/)
