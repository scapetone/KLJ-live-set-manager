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
| D-008 | 2026-11-02 | **Remplacée par D-013** | Concevoir un gestionnaire générique et réutilisable dès la V1. | Priorité modifiée : livraison rapide pour KLJ ; réutilisabilité éventuelle en bonus. |
| D-009 | 2026-11-02 | **Orientation validée** | Préparer un brief produit et technique complet destiné à Codex, le soumettre d'abord au mode Plan, puis viser une implémentation initiale cohérente en une passe. | Réduire les allers-retours de développement ; les validations sur Ableton/Push réel restent nécessaires. |
| D-010 | 2026-11-02 | **Validée** | **Push 2 en V1, option B :** la sélection automatique du bon instrument / de la piste de jeu est indispensable. L'imposition des modes de jeu, dispositions avancées (dont 64 pads) et personnalisations d'affichage est souhaitée mais **non bloquante**, sous réserve d'une faisabilité vérifiée sur Live 12/Push 2. | Livrer le moteur principal sans le bloquer sur une fonction avancée dépendant des limites de l'intégration Push. |
| D-011 | 2026-11-02 | **Validée** | **Gestion CPU V1 — option A :** une configuration doit permettre de gérer automatiquement les instruments inutilisés, avec des protections visant à préserver la continuité audio. | Éviter d'énumérer dans chaque configuration toutes les pistes à désactiver lors de l'ajout d'un instrument, tout en limitant les ressources inutiles. |

| D-012 | 2026-11-02 | **Validée** | Un seul mode : chaque clip déclenche une configuration complète du périmètre géré. Pour changer uniquement le tempo, on duplique la configuration et modifie le BPM. Pas de mode action ponctuelle distinct. | Simplicité et reproductibilité des réglages. |

| D-013 | 2026-11-02 | **Validée** | Priorité absolue à une V1 pour le live de Kiss La Joue, livrée rapidement. La généralisation à d'autres Live Sets est un bonus, non un objectif du cadrage actuel. | Réduire le périmètre pour accélérer la réalisation du device. |
| D-014 | 2026-11-02 | **Validée** | Le tableau expose une colonne par piste Ableton, audio **ou** MIDI, et une ligne par configuration complète. Le réglage d'activation/désactivation concerne les deux types de pistes. | L'utilisateur souhaite configurer explicitement les états par ligne, sans listes d'exclusion complexes. |
| D-015 | 2026-11-02 | **Validée** | La commande d'armement concerne uniquement les pistes MIDI ; elle ne doit pas être proposée pour les pistes audio dans ce produit. | Simplifier l'interface et refléter les besoins KLJ. |
| D-016 | 2026-11-02 | **Validée** | Lorsqu'une piste est ajoutée au Set, une nouvelle colonne apparaît dans le tableau ; l'utilisateur renseigne les états de cette piste configuration par configuration. | Éviter toute réécriture de macros existantes et permettre une édition visuelle directe. |

## Points **non tranchés**

- Configurations complètes validées (D-012). Pistes audio et MIDI présentes dans le tableau (D-014) ; reste à préciser le sens exact de « activation » (mute piste, activation device, ou deux commandes).
- Routage MIDI optimal (monitoring, armement, racks, autre) pour clavier et Push 2.
- Gestion CPU : **principe automatique validé (D-011)**, à articuler avec la configuration manuelle ligne par ligne (D-014/D-016), sans actions surprises sur les pistes audio.
- Apparition automatique des colonnes à l'ajout d'une piste (D-016) ; valeur initiale des cellules non renseignées, traitement des suppressions/renommages et référencement des pistes à préciser.
- Pilotage possible des dispositions/modes Push 2 en Live 12 sans dépendance legacy.
- Format définitif du tableau de configurations, persistance, import et export.
- Limites précises de la V1.

**Règle de travail :** toute nouvelle décision validée est ajoutée ici avec date et justification ; les hypothèses restent dans les questions ouvertes.
