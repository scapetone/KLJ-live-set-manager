# KLJ Live Set Manager — Référence d'interface V1

**Date : 2026-11-02.** Référence descriptive du **visuel approuvé** dans le cadrage D-033/D-034/D-035/D-036 ; **aucune capture pixel-perfect ni prototype Max exécutable n'est actuellement commité**.

## Organisation : tableau d'abord

Le device visible dans la chaîne Ableton est **compact** : nom de la configuration en cours, diagnostic non bloquant, commande d'ouverture de l'éditeur.

L'éditeur s'ouvre dans **une grande fenêtre indépendante**, lisible et redimensionnable si possible. La matrice prend **la majorité de l'espace**. Les paramètres usuels sont **éditables directement dans le tableau**, sans formulaire supplémentaire.

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ KLJ / LIVE MANAGER                                      ÉTAT : prêt / avertissement  │
│ CONFIGURATIONS                                                                     │
├────────────────────┬─────┬─────────┬──────────┬─────────┬──────┬─────────────┬──────┤
│ CLIP               │ BPM │ KEY     │ 11 KEYS  │ 14 LEAD │ PUSH │ PUSH MODE   │ PLUS │
├────────────────────┼─────┼─────────┼──────────┼─────────┼──────┼─────────────┼──────┤
│ HOW_DARE_YOU_A     │ 120 │ C Minor │    ON    │   ON    │ 14   │ NOTE IN KEY │  ⚙   │
│ HOW_DARE_YOU_B     │ 120 │ C Minor │   OFF    │   ON    │ 14   │ NOTE        │  ⚙   │
│ BREATHE            │ 112 │ F Minor │    ON    │   ON    │ 14   │ NOTE        │  ⚙   │
│ TRUE_PEAK_A        │ 118 │ F Minor │    ON    │   OFF   │  —   │ PADS        │  ⚙   │
├────────────────────┴─────┴─────────┴──────────┴─────────┴──────┴─────────────┴──────┤
│ + AJOUTER UNE LIGNE                            DUPLIQUER     SUPPRIMER              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ DÉTAILS [repliés par défaut] — ligne sélectionnée                                  │
│   Script JavaScript (multiligne, facultatif)                                       │
│   [                                                                  ]             │
│   [                                                                  ]             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

Les **noms, positions, BPM et états ci-dessus sont fictifs** : ne pas en déduire les noms réels des instruments ni les données à écrire dans le Live Set.

### Placement précis des paramètres

- **Toujours dans la grille** : `CLIP`, `BPM`, `KEY` (ex. C Minor), une colonne ON/OFF par piste **MIDI instrumentale**, `PUSH` (choix de piste par nom + numéro), `PUSH MODE` (quatre valeurs), `PLUS`.
- Les colonnes MIDI suivent **le même ordre que Live**, avec numéro + nom, même après déplacement. Plusieurs colonnes peuvent être ON simultanément, notamment pour les instruments clavier de Breathe.
- **Détails propres à la ligne, repliés par défaut** : script JavaScript Max natif multiligne et éventuels réglages complémentaires réellement utiles. **Ne pas cacher KEY ou PUSH MODE uniquement dans les détails**.
- **Opérations directes** : ajouter une ligne, renommer, supprimer ; dupliquer intégralement une ligne si simple. Faire défiler horizontalement les nombreuses pistes et verticalement les nombreux morceaux.
- Afficher la **configuration actuellement jouée** sans forcer la sélection/l'édition de sa ligne.
- Si une valeur `PUSH MODE` ne peut pas être exécutée automatiquement, son état dans l'interface doit **indiquer explicitement que le mode est non pilotable**, plutôt que faire croire à une réussite.

### Direction graphique confirmée

Référence : interface **dark**, minimaliste, musicale, soignée, sans panneaux et boutons décoratifs superflus.

| Usage | Couleur de référence (indicative) |
|---|---|
| Fond général | `#171B23` |
| Cellules et panneaux secondaires | `#252C38` |
| Séparateurs | `#353D49` |
| Texte principal | `#F3F5F9` |
| Texte secondaire | `#A9B5C6` |
| État ON et état correct | `#74D4AC` |
| État OFF / éléments désactivés | `#667083` |
| Accès aux détails et paramètres spéciaux | `#F3BA79` |

Conserver un **contraste net** et des cibles cliquables convenables. La maquette reste **une direction esthétique**, pas une spécification pixel-perfect. Les composants Max natifs sont préférables quand ils assurent une meilleure fiabilité d'édition, de sauvegarde et de défilement.

### À ne pas dessiner

- Aucune colonne ON/OFF ou fader automatique sur les **huit stems audio A/B** ; ces pistes restent à l'APC.
- Aucun panneau dédié aux effets True Peak ; leur cas spécial passe par le script JavaScript.
- Aucune boîte de dialogue imposée à la création d'une ligne.
- Pas d'ARM explicite, pas de panneau d'administration complexe, pas d'éditeur graphique de scripts.
- Aucun « bouton fonctionnel » de disposition Push si une commande API fiable n'a pas été démontrée.

Voir [SPEC_CODEX_V1.md](SPEC_CODEX_V1.md) pour les règles de fonctionnement : cette page ne remplace **pas** la spécification.
