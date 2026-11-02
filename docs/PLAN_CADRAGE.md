# Plan de cadrage produit — KLJ Live Set Manager

**Statut : spécification consolidée remise à Codex en entrée de mode Plan ; essais techniques ciblés restant à réaliser**  
**Date d'ouverture : 2026-11-02**  
**Objectif final :** disposer d'un brief suffisamment complet et non ambigu pour demander à Codex un plan d'implémentation, puis viser le développement d'une première version fonctionnelle en une passe, suivie de tests réels dans Ableton.

## Principes directeurs

- **Livrer vite pour KLJ.** Le besoin du Live Set Kiss La Joue est le périmètre de V1. La réutilisation par d'autres musiciens serait un bonus, non une exigence qui doit ralentir le projet. La structure actuelle de KLJ sert de point de départ.
- **Préserver le moteur musical natif de Live.** Les scènes, clips, boucles, Follow Actions et transitions A/B restent pilotés par Ableton.
- **Garder la logique de déclenchement ClyphX, pas ses contraintes techniques.** Un clip nommé, lu sur la piste où se trouve le device, applique la configuration associée, qu'il soit lancé par une scène ou par une Follow Action.
- **Ne pas reproduire mécaniquement l'existant.** Repartir des besoins, proposer les approches natives Ableton/Max for Live les plus simples et robustes.
- **Sobriété et stabilité scénique.** Ne pas ajouter de fonctionnalités ni de couches techniques sans valeur démontrée. Les changements doivent éviter toute interruption involontaire du son.
- **Décisions explicites.** Séparer besoins confirmés, hypothèses et faisabilité à vérifier. Ne rien présenter comme acquis avant validation.

## Séquence de cadrage

### 01 — Périmètre fonctionnel

**Objectif :** répertorier toutes les fonctions attendues et ce qui est explicitement exclu.

**À traiter :** configurations via clips ; instruments MIDI/clavier/Push ; monitoring, mute, armement, sélection, devices/effets ; tempo, fondamentale, gamme ; impact CPU ; maintenance des pistes ; comportements spécifiques Push ; fonctions nécessaires au live KLJ ; éviter les fonctionnalités supplémentaires non indispensables.

**Sortie :** catalogue priorisé en **indispensable V1**, **souhaitable/non bloquant**, **hors périmètre**.

**Critère de validation :** chaque fonction a un niveau de priorité et un scénario de référence ; les demandes non retenues sont identifiées.

**État :** en cours — premier inventaire issu des discussions et des macros.

### 02 — Moteur de déclenchement

**Objectif :** définir le contrat de fonctionnement entre Live et le device.

**À traiter :** piste de contrôle = piste hébergeant le device (D-027) ; noms des clips et correspondance avec configurations ; début réel de lecture ; lancement manuel ou Follow Action ; répétitions du même nom ; déclencheurs inconnus ; absence de piste ; conflits/événements rapprochés ; comportement à l'ouverture d'un Set.

**Sortie :** règles fonctionnelles et cas limites.

**Critère de validation :** un déclencheur appliqué dans plusieurs conditions donne un comportement non ambigu, sans refaire le moteur de progression des clips.

### 03 — Modèle de configuration et catalogue d'actions

**Objectif :** définir ce qu'une configuration contient et la façon dont ses actions s'appliquent.

**À traiter :** mode unique de configuration complète (D-012) ; matrice avec colonnes de pistes audio/MIDI (D-014) ; armement MIDI uniquement (D-015) ; paramètres globaux (BPM, root, gamme) ; état et routage des pistes MIDI ; sélection Push ; activation/désactivation de devices ; gestion CPU ; sémantique d'activation à préciser ; création automatique d'une colonne quand une piste est ajoutée (D-016) ; plusieurs instruments simultanés (Breathe).

**Sortie :** modèle conceptuel des données et catalogue des actions avec paramètres, effet attendu, défauts et limites.

**Critère de validation :** pouvoir représenter fidèlement des scénarios comme True Peak A/B, Breathe et une transition avec palier de tempo, en s'appuyant sur les pistes identifiées dans le Set KLJ.

### 04 — Interface et parcours utilisateur

**Objectif :** rendre le paramétrage compréhensible pour un musicien non développeur.

**À traiter :** tableau des configurations/déclencheurs et panneau de détails (D-023) ; colonne par instrument MIDI avec numéro + nom et ordre Live (D-031) ; édition, duplication simple (D-029), suppression, sauvegarde interne ALS (D-030) ; retour visuel sur la dernière configuration ; erreurs visibles ; ajout de pistes MIDI (D-024). Les 8 stems audio restent gérés par APC (D-018).

**Sortie :** maquette validée et règles d'interaction (pas encore du code).

**Critère de validation :** un utilisateur peut créer et modifier une configuration, puis intégrer une nouvelle piste sans reprendre toutes les anciennes lignes.

### 05 — Validation de faisabilité et architecture

**Objectif :** lever les inconnues bloquantes avant de figer le brief technique.

**À traiter :** les trois essais ciblés P1 lancement/Follow Actions, P2 sélection Push/Monitor IN et P3 JavaScript dynamique + sauvegarde ([protocole](VALIDATION_TECHNIQUE_CODEX.md)). Vérifier le référencement des pistes et l'absence de contrôle des stems APC. Les modes Push 64 pads restent non bloquants ; le CPU reste à mesurer plutôt qu'à promettre.

**Sortie :** matrice **supporté / à prototyper / impossible ou hors V1**, architecture proposée, contournements décidés et dépendances documentées.

**Critère de validation :** aucune fonctionnalité indispensable à la V1 n'est fondée uniquement sur une possibilité supposée ; les points critiques sont confirmés par documentation ou par tests ciblés.

### 06 — Scénarios de test et critères d'acceptation

**Objectif :** définir ce que « fonctionne » signifie pour Codex et pour le live.

**À traiter :**
- **KLJ :** lecture par scène, Follow Action, boucle puis reprise, True Peak A/B, Breathe avec deux instruments clavier, transitions A/B, changements de tempo et Push 2 ;
- **Structure KLJ :** ajout et déplacement de nouvelles pistes et modification de leurs états dans toutes les configurations ;
- **Robustesse :** ajout/retrait/réordonnancement de pistes, clip inconnu, renommage, répétitions, sauvegarde/réouverture, absence de device, continuité audio et coût CPU.

**Sortie :** scénarios Given/When/Then ou équivalents, avec résultats observables et critères de réussite.

**Critère de validation :** chaque fonction V1 possède au moins un test positif et, lorsque pertinent, un test d'échec ou de robustesse.

### 07 — Dossier de réalisation Codex

**Objectif :** livrer une spécification exploitable pour développer sans improviser le produit.

**À assembler :** brief final ; périmètre V1 ; règles de déclenchement ; modèle d'actions et données ; maquette ; architecture documentée ; tests ; contraintes et limites techniques ; exigences de packaging/livraison du device Max for Live.

**Séquence Codex :**
1. Fournir tout le dossier à Codex en **mode Plan**.
2. Lui demander d'identifier les contradictions, risques et hypothèses restantes, puis de proposer un plan d'exécution.
3. Résoudre les points réellement bloquants et valider le plan.
4. Viser un développement de la V1 complet en une passe.
5. Tester dans Ableton et sur Push 2 réel ; corriger uniquement sur la base de ces résultats.

**Critère de validation :** le brief permet d'implémenter les comportements attendus sans choix produit implicite. L'objectif « une passe » n'est pas une garantie d'absence de corrections après essais matériels.

## Méthode d'itération

Pour chaque étape :
1. L'assistant propose une synthèse des connaissances et **uniquement les arbitrages encore utiles**.
2. On discute des options sur des exemples concrets.
3. L'utilisateur valide ou corrige.
4. Mise à jour des fichiers GitHub : [brief](BRIEF_PRODUIT.md), [décisions](DECISIONS.md) et [questions ouvertes](QUESTIONS_OUVERTES.md).
5. On n'avance à l'étape suivante qu'une fois le résultat suffisamment précis.

**Règle :** une discussion = un thème principal, sans bureaucratie inutile.

## Suivi des étapes

| Étape | Statut | Livrable |
|---|---|---|
| 01 — Périmètre | **Largement cadré** | D-001 à D-032, exclusions à finaliser |
| 02 — Déclenchement | **Règles définies, P1 à tester** | D-027/D-028, boucles et Follow Actions |
| 03 — Actions et configurations | **Largement cadré, points techniques ouverts** | Grille MIDI, BPM/gamme, Push, scripts JS |
| 04 — Interface | **Structure validée** | Tableau + panneau D-023, détails UI à préciser |
| 05 — Faisabilité | **Documentation vérifiée, P1/P2/P3 à exécuter** | [Protocole](VALIDATION_TECHNIQUE_CODEX.md) |
| 06 — Tests | **Trame créée** | Trois POC + scénarios KLJ |
| 07 — Codex | **Brief V1 consolidé, mode Plan à lancer** | [Spécification Codex V1](SPEC_CODEX_V1.md) / plan d'implémentation à produire |

## Références

- [Spécification consolidée pour Codex](SPEC_CODEX_V1.md)
- [Brief produit](BRIEF_PRODUIT.md)
- [Décisions](DECISIONS.md)
- [Questions ouvertes](QUESTIONS_OUVERTES.md)
- [Validation technique ciblée avant Codex](VALIDATION_TECHNIQUE_CODEX.md)
- [Issue discovery initiale](https://github.com/scapetone/KLJ-live-set-manager/issues/1)

Le plan définit **l'ordre de nos travaux**, pas la validation anticipée des fonctionnalités ou de la solution technique.
