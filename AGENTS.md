# KLJ Live Set Manager — consignes pour Codex

**Mission : produire une première version utilisable, pas refaire le cadrage.**

1. Lis **uniquement** [docs/SPEC_CODEX_V1.md](docs/SPEC_CODEX_V1.md) pour les exigences. Consulte [docs/MAQUETTE_UI.md](docs/MAQUETTE_UI.md) pour le visuel si nécessaire.
2. Les autres fichiers `docs/` sont des archives/recherches : **ne les lis que si une difficulté précise le justifie**. La spécification V1 prime en cas de contradiction.
3. Implémente de bout en bout la solution Max for Live **la plus simple et robuste** possible, sans framework générique, sans langage ClyphX et sans installer spontanément des skills, MCP ou autres dépendances.
4. Ne t'arrête pas à un plan ou à des PoC théoriques : livre les patchs, le code et des instructions courtes pour que le musicien teste dans **Ableton Live 12 + Push 2**. Réalise les validations automatiques faisables dans ton environnement ; ne prétends pas avoir testé le matériel absent.
5. **Règle absolue : ne touche jamais au volume ou au Track Activator/Mute des huit stems audio** (APC). Contrôle uniquement les Track Activators des instruments MIDI. Pas de commande ARM/Monitor dynamique sans nécessité démontrée.
6. **Push :** la sélection de piste est indispensable. Les quatre modes demandés sont documentés mais **leur changement automatique n'est pas confirmé** via l'API publique. Implémente ce qui est faisable ; une option non pilotable doit être clairement signalée, jamais présentée comme fonctionnelle.
7. **Script JavaScript libre :** pas de DSL ; implémente l'évaluation dynamique et la persistance si faisables. Capte les exceptions. Ne remplace pas un blocage technique par une fonctionnalité factice.
8. À la fin, fournis : **fichiers livrés, installation, tests à faire dans Live, limites connues**. N'interroge l'utilisateur que pour un vrai blocage empêchant d'avancer.

**Philosophie : première implémentation complète → essai par le musicien → corrections ciblées.**
