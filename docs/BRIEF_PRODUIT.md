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
- Les clips déclencheurs peuvent aussi représenter des changements ponctuels, comme le tempo, sans changement de morceau.
- Les scènes, stems et Follow Actions restent gérés nativement par Ableton.

La forme exacte des noms, la syntaxe et la stratégie de sauvegarde restent à décider.

## 5. Besoins exprimés à prendre en charge

### P0 — Besoin central

- Configurer automatiquement le **bon instrument joué depuis Push 2** à chaque déclenchement concerné.
- Configurer le ou les **instruments joués depuis le clavier MIDI**, y compris le cas où deux pistes doivent jouer en parallèle.
- Ne pas perturber la lecture des huit pistes audio ni les transitions A/B.
- Permettre une progression autonome lors des Follow Actions tout en gardant la reprise en main par lancement manuel de scène.

### Besoins importants, détail à préciser

- **Push 2 — choix V1 validé (option B) :** sélection automatique du bon instrument / de la piste jouée **indispensable** ; modes avancés, disposition « 64 pads » et personnalisation d'affichage **souhaitables, non bloquants et conditionnés à une faisabilité confirmée** sur Live 12/Push 2. Les réglages de gamme/fondamentale restent à détailler dans le catalogue des actions. La sélection seule doit avoir un comportement utile même si les modes avancés ne sont pas réalisables.
- **Tempo et réglages musicaux :** actions globales ou attachées à une configuration, y compris paliers de tempo pendant une transition.
- **Effets et devices :** possibilité de les activer/désactiver à certains moments d'un morceau.
- **CPU — option A validée pour la V1 (D-011) :** gestion **automatique** des instruments inutilisés, avec protections pour éviter les coupures ou perturbations sonores. L'utilisateur ne doit pas avoir à ajouter à chaque configuration une liste exhaustive de nouveaux instruments à désactiver. Cette fonction doit rester générique, sans structure de pistes KLJ codée en dur.
  - **Non décidé :** comment délimiter les instruments pris en charge ; comment déterminer qu'un instrument est « inutilisé » ; faut-il désactiver l'instrument, la piste ou certains effets ; faut-il un délai, une exception ou une préactivation avant le jeu.
  - **Contrainte :** ne pas assimiler `Track.mute` à une économie CPU garantie ; ne pas arrêter automatiquement les stems ou d'autres traitements non concernés.
  - **Validation requise :** mesures de charge, temps de réactivation, notes tenues/queues d'effets et transitions dans Ableton réel.
- **Maintenance :** détecter ou intégrer facilement des pistes nouvellement ajoutées sans éditer toutes les configurations.
- **Interface :** tableau de configurations associé aux noms de clips, avec une visualisation compréhensible des pistes et actions.

Ces besoins ne constituent **pas encore** le périmètre ferme de la V1.

## 6. Contraintes et critères d'évaluation

- **Fiabilité scénique :** comportement prévisible et absence de changements intempestifs pendant les transitions.
- **Simplicité de maintenance :** ajout d'instruments et de morceaux sans modifications répétitives.
- **Compatibilité avec la Session View actuelle :** conserver les clips et Follow Actions.
- **Contrôle clair :** différencier choix de l'instrument, routage/monitoring MIDI, mute, armement, activation de device et sélection visuelle.
- **Réactivité :** les changements doivent intervenir suffisamment vite pour ne pas gêner le jeu. Les timings acceptables restent à mesurer.
- **Robustesse :** comportement lors d'une relance du même clip, d'une piste absente et d'un changement de structure à définir.

## 7. Réutilisabilité — orientation validée

Le gestionnaire doit être **un outil générique**, dont Kiss La Joue constitue un jeu de scénarios de validation. La configuration du live KLJ n'est **pas** une convention imposée aux autres utilisateurs.

- Ne fixer dans le code ni le nombre de pistes ni leur ordre ni leurs noms.
- Ne pas supposer deux decks A/B, quatre stems par morceau, une piste de déclenchement à l'indice 9, ni même la présence de stems.
- La piste surveillée pour les clips déclencheurs doit être **choisie par l'utilisateur**.
- Les pistes et devices ciblés doivent être **choisis/configurés dans l'interface**, sans modifier le code pour adapter un Live Set.
- Les noms de déclencheurs doivent être libres ; on peut réutiliser un déclencheur dans plusieurs clips.
- Push 2 et le clavier MIDI sont des cas d'usage importants de KLJ, **pas** des prérequis universels du logiciel.

Le mécanisme exact de référencement des pistes/devices et l'étendue des fonctions spécifiquement Push restent à explorer.

## 8. Cible de livraison pour Codex

L'objectif est de finaliser **ensemble** un brief assez précis (comportements, interface, limites techniques, cas tests et critères d'acceptation) pour le transmettre à Codex en mode Plan, puis **viser** une première implémentation de bout en bout.

Cette intention n'implique pas que le code sera garanti correct sans validation dans Live : l'intégration du Push 2, le routage MIDI et les performances doivent faire l'objet de tests réels.

## 9. Hors périmètre décidé à ce jour

- Refaire le séquencement musical, les Follow Actions ou la gestion des scènes.
- Développer une IA exécutée pendant le concert.
- Reproduire à l'identique toutes les commandes et les conventions du fichier ClyphX.

**Aucune architecture d'implémentation (JavaScript, jit.cellblock, pattrstorage, Instrument Racks, etc.) n'est encore choisie.**

Voir [Décisions](DECISIONS.md) et [Questions ouvertes](QUESTIONS_OUVERTES.md).
