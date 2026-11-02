# Brief produit — KLJ Live Set Manager

> **Document de travail, version 0.1 (2026-11-02).** Ce texte rassemble les éléments exprimés et confirmés pendant le cadrage. Les choix d'interface, de moteur MIDI et de réalisation technique ne sont **pas encore validés**.

## 1. Problème à résoudre

Pendant un live de Kiss La Joue, le Set Ableton évolue au fil de scènes et de Follow Actions. Les musiciens doivent pouvoir se concentrer sur le jeu tout en retrouvant, au bon moment, les instruments et réglages appropriés. Aujourd'hui ces changements sont produits par une piste dédiée aux clips ClyphX et un fichier de macros.

Deux difficultés identifiées :
- **Maintenance :** lorsqu'une piste est ajoutée, de nombreuses macros doivent être modifiées pour gérer son état.
- **Pilotage / fiabilité :** le musicien souhaite que Push 2 soit automatiquement positionné sur le bon instrument avec une disposition de jeu adaptée, sans dépendre inutilement de mécanismes legacy.

La réduction de la consommation CPU liée aux instruments et effets inutilisés fait également partie du besoin. Ne pas confondre mute audio et suspension du calcul d'un plugin.

## 2. Contexte du Set actuel (existant, non prescriptif)

- **8 pistes audio de stems**, en deux decks A/B de 4 pistes : kick, drums, bass, instruments ; elles permettent les mashups, superpositions et transitions.
- **1 piste dédiée au déclenchement ClyphX**, contenant des clips nommés pour rappeler des configurations ou réaliser des actions ponctuelles.
- **Pistes MIDI d'instruments** dédiées à un clavier MIDI et à Push 2. Chaque piste dispose de son instrument. Un morceau (**Breathe**) requiert deux instruments simultanés pour le clavier.
- Ancienne **piste 10 d'entrée basse/guitare** : non nécessaire à terme, car l'instrument est branché directement sur la console de mixage.
- Le fichier `Macros.txt` fourni comporte des réglages de tempo, mute/monitoring MIDI, sélection de piste, réglages Push et activation d'un device. Il décrit le fonctionnement historique, **pas une implémentation à copier**.
- Dans les macros existantes, les commandes de pistes utilisent principalement `MUTE` et `MON`, **pas `ARM`** : monitoring, mute et armement doivent être distingués lors du cadrage.

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

**D-012 — Mode unique de configuration complète :** chaque clip applique l'état prévu par sa ligne de configuration. **D-014 :** les pistes audio et MIDI figurent toutes dans le tableau, et l'activation/désactivation est configurable pour les deux types. L'interface devra offrir une duplication rapide des configurations ; à l'exécution, éviter les actions redondantes sera étudié pour préserver la continuité audio. Le périmètre précis, le format des noms et la sauvegarde restent à définir.

## 5. Besoins exprimés à prendre en charge

### P0 — Besoin central

- Configurer automatiquement le **bon instrument joué depuis Push 2** à chaque déclenchement concerné.
- Configurer le ou les **instruments joués depuis le clavier MIDI**, y compris le cas où deux pistes doivent jouer en parallèle.
- Préserver la progression musicale et les transitions A/B. Les pistes audio participent au tableau d'activation, mais les actions ne doivent pas provoquer de coupures imprévues.
- Permettre une progression autonome lors des Follow Actions tout en gardant la reprise en main par lancement manuel de scène.

### Besoins importants, détail à préciser

- **Push 2 — choix V1 validé (option B) :** sélection automatique du bon instrument / de la piste jouée **indispensable** ; modes avancés, disposition « 64 pads » et personnalisation d'affichage **souhaitables, non bloquants et conditionnés à une faisabilité confirmée** sur Live 12/Push 2. Les réglages de gamme/fondamentale restent à détailler dans le catalogue des actions. La sélection seule doit avoir un comportement utile même si les modes avancés ne sont pas réalisables.
- **Tempo et réglages musicaux :** actions globales ou attachées à une configuration, y compris paliers de tempo pendant une transition.
- **Effets et devices :** possibilité de les activer/désactiver à certains moments d'un morceau.
- **CPU — option A validée pour la V1 (D-011) :** gestion **automatique** des instruments inutilisés, avec protections pour éviter les coupures ou perturbations sonores. Cette intention reste à articuler avec le nouveau modèle de grille explicite (D-014). L'utilisateur ne doit pas avoir à ajouter à chaque configuration une liste exhaustive de nouveaux instruments à désactiver. La priorité est une réalisation simple pour KLJ.
  - **Non décidé :** comment délimiter les instruments pris en charge ; comment déterminer qu'un instrument est « inutilisé » ; faut-il désactiver l'instrument, la piste ou certains effets ; faut-il un délai, une exception ou une préactivation avant le jeu.
  - **Contrainte :** ne pas assimiler `Track.mute` à une économie CPU garantie ; ne pas arrêter automatiquement les stems ou d'autres traitements non concernés.
  - **Validation requise :** mesures de charge, temps de réactivation, notes tenues/queues d'effets et transitions dans Ableton réel.
- **Maintenance :** lorsqu'une piste apparaît dans Live, ajouter une colonne au tableau ; l'utilisateur configure ses états ligne par ligne sans modifier de macros.
- **Interface :** tableau de configurations complètes associé aux noms de clips, duplication simple d'une configuration, colonnes de pistes audio/MIDI et commandes d'armement sur MIDI uniquement.

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
- L'utilisateur configure pour chaque ligne l'état d'**activation/désactivation** de chaque piste, qu'elle soit audio ou MIDI.
- Le réglage **d'armement est réservé aux pistes MIDI** dans l'interface KLJ.
- Une nouvelle piste ajoutée à Ableton doit produire **une nouvelle colonne** dans le tableau. L'utilisateur renseigne ensuite les valeurs pour chaque configuration existante, sans modifier manuellement des macros.
- Tempo, fondamentale/gamme, sélection Push et états spécifiques de devices doivent aussi être représentables dans les configurations, selon une mise en page à concevoir.

**À définir :** « activation » signifie-t-elle mute/unmute de la piste, on/off du device, ou deux réglages distincts ? Quelle valeur initiale affecter aux nouvelles cellules en attendant leur configuration ? Comment concilier D-011 (gestion CPU automatique) avec les états saisis explicitement dans le tableau ?

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
