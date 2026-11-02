# Journal des décisions produit

Les décisions ci-dessous concernent le **besoin et l'expérience attendue**, pas encore l'implémentation technique.

Statuts :
- **Orientation validée** : méthode ou objectif accepté, mais non une garantie de faisabilité technique.
- **Validée** : explicitement confirmé pendant le cadrage.
- **À investiguer** : proposition ou hypothèse, non décidée.
- **Remplacée** : décision devenue obsolète (à conserver pour l'historique).

| ID | Date | Statut | Décision | Justification |
|---|---|---|---|---|
| D-001 | 2026-11-02 | **Validée** | Conserver la progression des clips/scènes et les Follow Actions natives d'Ableton. | Le système actuel est synchronisé, musicalement construit et apprécié. |
| D-002 | 2026-11-02 | **Validée** | Conserver une **piste de clips déclencheurs** ; la lecture d'un clip nommé applique la configuration liée. | C'est la logique d'utilisation que l'on souhaite préserver de ClyphX. |
| D-003 | 2026-11-02 | **Validée** | Le déclenchement fonctionne qu'il provienne d'un lancement manuel de scène ou d'une Follow Action. | Les musiciens alternent séquences automatiques et boucles d'attente. |
| D-004 | 2026-11-02 | **Validée** | Autoriser plusieurs configurations pour un même morceau et plusieurs occurrences d'un même déclencheur. | Changements d'instruments/effets au fil du titre. |
| D-005 | 2026-11-02 | **Validée** | Ne **pas** reproduire aveuglément les macros ou la structure technique de ClyphX. | L'existant peut être contraint ou sous-optimal. Concevoir à partir des besoins. |
| D-006 | 2026-11-02 | **Validée** | La piste historique d'entrée basse/guitare (n° 10 dans l'ancien Set) n'est pas un besoin de l'outil cible. | Le signal va directement à la console externe. |
| D-007 | 2026-11-02 | **Validée** | D'abord cadrage produit itératif, ensuite spécifications exploitables par Codex. | Ne pas engager une architecture ou un développement trop tôt. |
| D-008 | 2026-11-02 | **Validée** | Concevoir un gestionnaire générique et réutilisable, sans hypothèse codée en dur sur le nombre de pistes, leur ordre, le nombre de stems, les contrôleurs ou les noms de morceaux. | Kiss La Joue est le cas de test de référence, mais d'autres musiciens doivent pouvoir l'utiliser sur des Sets très différents. |
| D-009 | 2026-11-02 | **Orientation validée** | Préparer un brief produit et technique complet destiné à Codex, le soumettre d'abord au mode Plan, puis viser une implémentation initiale cohérente en une passe. | Réduire les allers-retours de développement ; les validations sur Ableton/Push réel restent nécessaires. |

## Points **non tranchés**

- Système de snapshots complets, d'actions ponctuelles ou hybride.
- Routage MIDI optimal (monitoring, armement, racks, autre) pour clavier et Push 2.
- Gestion CPU : quels devices éteindre, quand, et avec quelles protections.
- Manière exacte d'intégrer les nouveaux instruments et de référencer les pistes.
- Pilotage possible des dispositions/modes Push 2 en Live 12 sans dépendance legacy.
- Format définitif du tableau de configurations, persistance, import et export.
- Limites précises de la V1.

**Règle de travail :** toute nouvelle décision validée est ajoutée ici avec date et justification ; les hypothèses restent dans les questions ouvertes.
