# KLJ Live Set Manager

Device **Max for Live** pour piloter les configurations de scène du Live Set **Kiss La Joue**, dans **Ableton Live 12 / Push 2**. Remplace les macros ClyphX déclenchées par des clips, sans toucher aux scènes ni aux Follow Actions natives.

**État : développement à lancer. Aucun device testé dans Live à ce stade.**

## Pour Codex : lire seulement ces deux fichiers

1. **[AGENTS.md](AGENTS.md)** — méthode : **construire maintenant, puis faire tester**.
2. **[Brief V1](docs/SPEC_CODEX_V1.md)** — fonctionnement, interface, règles de sécurité, livrables et tests.

Si nécessaire uniquement : [référence graphique](docs/MAQUETTE_UI.md). Les autres fichiers `docs/` conservent l'historique du cadrage et des recherches ; **ils ne sont pas requis** pour commencer.

## Workflow prévu

**Codex implémente la V1 → le musicien installe et essaie le device dans Live avec Push 2 → Codex corrige les problèmes constatés.**

Pas de framework générique, pas de dépendance MCP ou skill externe imposée, pas de blocage sur les modes Push avancés si l'API publique ne sait pas les régler. La matrice ne pilote que les pistes MIDI d'instruments ; les huit stems audio restent contrôlés manuellement par l'APC.
