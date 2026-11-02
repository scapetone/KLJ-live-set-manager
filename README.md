# KLJ Live Set Manager

**Statut : spécification V1 consolidée, prête pour une revue Codex en mode Plan — pas encore de développement ni de validation dans Ableton/Push 2.**

Projet de Max for Live pour simplifier et fiabiliser le pilotage des configurations du live Ableton de **Kiss La Joue (KLJ)**. **Objectif V1 : répondre au besoin de KLJ le plus rapidement possible**, sans développer d'abord un produit universel.

## Vision

Conserver la progression musicale actuelle d'Ableton Live (Session View, scènes, clips, Follow Actions et transitions entre deux decks de stems), tout en remplaçant la gestion manuelle des macros ClyphX par un éditeur visuel de configurations.

**Principe central validé :** le device est placé directement sur la piste contenant les clips déclencheurs. Lorsqu'un clip nommé commence effectivement à jouer (scène lancée manuellement ou Follow Action), le gestionnaire applique sa configuration. Les tours d'une boucle naturelle ne réexécutent pas la configuration. Les scripts JavaScript utilisateur, s'il y en a, sont propres à chaque configuration.

Le projet n'a **pas** pour objectif de recréer le moteur de séquencement des clips ni de reproduire les commandes ClyphX à l'identique.

**Interface V1 validée :** grande fenêtre sombre avec tableau directement éditable : une ligne par configuration, cellules BPM/KEY/Push/PUSH MODE et une colonne ON/OFF par instrument MIDI. Panneau de détails repliable pour le JavaScript libre. Les stems audio des deux decks restent contrôlés manuellement par l'APC : le device **ne change ni leur volume ni leur Track Activator**. Une nouvelle piste MIDI ajoute une colonne OFF par défaut ; les colonnes affichent leur numéro et nom et suivent l'ordre des pistes Live. **Pas d'armement MIDI explicite requis en V1**, sous réserve des essais avec Push 2.

## Point de départ pour Codex

**[Spécification consolidée V1](docs/SPEC_CODEX_V1.md)** — contrat fonctionnel, interface, priorités, limites techniques, tests P1/P2/P3 et instruction initiale à copier dans Codex. **Lire ce document en premier** avant le brief exploratoire. Codex trouve également ses [instructions de travail](AGENTS.md) à la racine.

## Documentation produit

- [Plan de cadrage en 7 étapes](docs/PLAN_CADRAGE.md) — méthode, livrables et suivi
- [Référence graphique approuvée](docs/MAQUETTE_UI.md) — maquette de la fenêtre sous forme de wireframe et couleurs
- [Brief produit historique / exploratoire](docs/BRIEF_PRODUIT.md)
- [Décisions prises](docs/DECISIONS.md)
- [Questions ouvertes / discovery](docs/QUESTIONS_OUVERTES.md)
- [Validation technique ciblée avant Codex](docs/VALIDATION_TECHNIQUE_CODEX.md) — 3 essais POC Live/Push/JS
- [Étude JavaScript dynamique](docs/FAISABILITE_SCRIPTS_JS.md)

## Méthode

1. Décrire le fonctionnement et les besoins réels du live.
2. Distinguer les décisions validées des hypothèses.
3. Examiner les options natives Ableton / Max for Live, avec des tests ciblés quand nécessaire.
4. Valider ensemble les parcours utilisateurs et le périmètre d'une première version.
5. Soumettre le brief consolidé à Codex en mode Plan, lever les trois points techniques ciblés, puis développer la V1 et tester dans le vrai Set.

Les captures du Set et le fichier `Macros.txt` ont servi à comprendre l'existant ; ils ne sont pas publiés dans ce dépôt.

Dernière mise à jour : 2026-11-02.
