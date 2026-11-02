# Instructions pour Codex — KLJ Live Set Manager

## Première action attendue : PLAN, pas code

Ce dépôt contient **une spécification et des recherches**, mais **pas encore de device Max for Live ni de tests matériels réussis**. Commencer par lire dans cet ordre :

1. [Spécification V1 — source de vérité](docs/SPEC_CODEX_V1.md)
2. [Journal des décisions D-001 à D-036](docs/DECISIONS.md)
3. [Protocole de tests P1/P2/P3](docs/VALIDATION_TECHNIQUE_CODEX.md)
4. [Faisabilité JS libre](docs/FAISABILITE_SCRIPTS_JS.md)
5. [Référence UI](docs/MAQUETTE_UI.md)

[Brief produit](docs/BRIEF_PRODUIT.md), [questions ouvertes](docs/QUESTIONS_OUVERTES.md) et [plan de cadrage](docs/PLAN_CADRAGE.md) contiennent **aussi des propositions exploratoires anciennes**. En cas de divergence, suivre la **spécification consolidée** puis les décisions récentes. Ne pas réintroduire des choix remplacés sans en parler.

## Invariants du produit

- **Ne jamais modifier le volume, le Mute/Track Activator ou le mixage des huit stems audio A/B** : l'APC les gère manuellement.
- La matrice ON/OFF pilote les **Track Activators des pistes MIDI d'instruments** (`Track.mute` : 0 = actif, 1 = inactif). **Ne pas confondre avec `Device On`**.
- Le device est installé sur la **piste des clips déclencheurs**, identifiée automatiquement. Les scènes et Follow Actions restent natives dans Live.
- Un lancement réel applique **une configuration complète** ; une boucle naturelle ne doit **pas** relancer le script. Le cas *Play Again* sur le même slot nécessite un test.
- Clavier Vortex : plusieurs pistes MIDI actives en parallèle ; Push 2 : sélection automatique de la piste instrumentale voulue. Monitor IN et MIDI From sont **préconfigurés**, sous réserve d'essais matériels.
- **Pas d'ARM automatique** tant que les tests ne montrent pas qu'il est nécessaire.
- **Pas de Remote Script Push 2 legacy**, pas de DSL ClyphX, pas d'interpréteur de commandes propriétaire.
- **KEY** et **PUSH MODE** font partie du tableau. Les quatre modes Push désirés sont `NOTE`, `NOTE IN KEY`, `PADS` (Drum Rack 16 pads + séquenceur), `64 PADS`. **Leur automatisation via l'API publique n'est pas démontrée.** `ControlSurface.pad_layout` est en lecture/observation seulement : ne pas simuler un contrôle fonctionnel.
- Script JavaScript natif libre propre à chaque ligne ; mécanisme d'évaluation dynamique et persistance dans `.als` **à prouver par PoC**, pas à supposer.
- Privilégier une solution simple et maintenable, adaptée au Live Set KLJ. Le choix d'une UI custom ne doit pas détourner le projet d'un tableau éditable et fiable.

## Livrable demandé en mode Plan

Produire **un seul plan d'implémentation cohérent** : architecture Max/Max for Live minimale, structures de données, composants UI, persistance dans `.als`, observation des clips, application des configurations, scripts JS, chemins de fichiers livrables, cas d'erreur, séquence de PoC et critères d'acceptation.

Séparer nettement **(A) API documentée, (B) tests Live/Push nécessaires, (C) limitations possibles, (D) décisions produit vraiment bloquantes**. Ne déclarer aucun résultat matériel comme acquis. Après validation du plan, viser une V1 de bout en bout puis des tests **dans Ableton Live 12 avec Push 2**.

Les captures d'écran, le vrai Live Set et le fichier `Macros.txt` historique **ne sont pas présents dans ce dépôt**. Ne pas les inventer et signaler uniquement si leur absence bloque une vérification précise.
