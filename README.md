# KLJ Live Set Manager

**Statut : cadrage produit / discovery — pas encore de développement.**

Projet de Max for Live pour simplifier et fiabiliser le pilotage des configurations d'un live Ableton de **Kiss La Joue (KLJ)**.

## Vision

Conserver la progression musicale actuelle d'Ableton Live (Session View, scènes, clips, Follow Actions et transitions entre deux decks de stems), tout en remplaçant la gestion manuelle des macros ClyphX par un éditeur visuel de configurations.

**Principe central validé :** lorsqu'un clip portant un nom de déclencheur donné entre en lecture sur une piste dédiée, le gestionnaire applique la configuration correspondante. Ce déclenchement fonctionne aussi bien après un lancement manuel de scène qu'après une Follow Action.

Le projet n'a **pas** pour objectif de recréer le moteur de séquencement des clips ni de reproduire les commandes ClyphX à l'identique.

## Documentation produit

- [Brief produit (en construction)](docs/BRIEF_PRODUIT.md)
- [Décisions prises](docs/DECISIONS.md)
- [Questions ouvertes / discovery](docs/QUESTIONS_OUVERTES.md)

## Méthode

1. Décrire le fonctionnement et les besoins réels du live.
2. Distinguer les décisions validées des hypothèses.
3. Examiner les options natives Ableton / Max for Live, avec des tests ciblés quand nécessaire.
4. Valider ensemble les parcours utilisateurs et le périmètre d'une première version.
5. **Seulement ensuite**, rédiger des spécifications techniques et des tâches de développement exploitables par Codex.

Les captures du Set et le fichier `Macros.txt` ont servi à comprendre l'existant ; ils ne sont pas publiés dans ce dépôt.

Dernière mise à jour : 2026-11-02.
