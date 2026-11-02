# Discovery — questions ouvertes

**Statut : exploration, pas un backlog de développement.**

L'ordre ci-dessous constitue une proposition de discussion, **pas** une priorité produit officiellement validée. Chaque question devra mener soit à une décision documentée, soit à un test technique ciblé.

## A. Parcours et configurations

1. **Résolu par D-012/D-014 :** une configuration est complète et le tableau comporte toutes les pistes audio et MIDI. Reste à définir les réglages exacts de chaque colonne et leur comportement.
2. Comment rendre la duplication d'une configuration complète rapide, même lorsqu'on ne modifie qu'un BPM ou l'état d'un effet ?
3. Que doit-il se passer si un clip déclencheur est lancé une seconde fois, s'il est inconnu, ou si sa configuration fait référence à une piste disparue ?
4. Faut-il conserver les noms de déclencheurs historiques `$TRUE_PEAK_A$`, `$BREATHE$`, etc. ou définir un format plus simple ?

## B. Instruments et contrôleurs

5. Dans les conditions réelles du Set, quelle méthode est la plus robuste pour assigner clavier et Push aux instruments : monitoring, armement, routage, racks ou autre ?
6. Pour Breathe, faut-il toujours faire jouer deux instruments simultanément avec le clavier, sans split de notes, ou y a-t-il des cas particuliers ?
7. **Arbitrage V1 rendu (D-010)** : sélection du bon instrument/piste indispensable ; modes et disposition avancés non bloquants. Préciser les comportements attendus pour « sélectionner » (piste sélectionnée dans Live, instrument effectivement jouable au Push, suivi de la sélection par Push).
8. **À vérifier techniquement** : quels comportements Push 2 sont réalisables de façon fiable avec Live 12 / Max for Live sans ancien Remote Script ? Tester notamment le « 64 pads » ; le résultat ne doit pas bloquer la V1.

## C. CPU, continuité sonore et stabilité

**Décision prise (D-011) : gestion automatique des instruments inutilisés en V1, avec protections audio.** Ce choix ne préjuge pas du mécanisme Max for Live.

9. **D-017 : Device ON/OFF est privilégié pour le CPU.** Quels instruments et effets ont réellement un coût significatif ? Quels devices précis associer à chaque colonne de piste ?
10. À quel moment peut-on couper un device sans couper une note tenue, une réverbération ou une transition ? Faut-il différer l'arrêt / réactiver avant l'utilisation ?
11. Quel compromis accepte-t-on entre économie CPU, latence de réactivation et continuité sonore ? Comment définit-on « instrument inutilisé » dans le périmètre d'une configuration complète ?
12. **Résolu par D-018 pour le mixage :** volumes et Mute des stems audio sont contrôlés manuellement par APC. Si des effets audio sont pilotés via Device ON/OFF, quelles protections évitent les coupures non voulues ?

## D. Maintenance et interface

13. Une nouvelle piste ajoute une colonne (D-016) : quelle valeur provisoire pour ses cellules non renseignées ? Comment gérer ensuite renommage, déplacement et suppression ?
14. La représentation par colonnes de pistes est validée (D-014). Comment afficher clairement activation des pistes audio/MIDI, armement MIDI, Push, tempo et devices ?
15. Comment enregistrer, dupliquer, comparer et réappliquer les configurations ? Que souhaite-t-on sauvegarder dans le Live Set ?
16. Comment vérifier avant concert qu'aucun déclencheur ne référence un instrument introuvable ?

## E. Validation progressive

17. Quel est le **premier parcours complet** à reproduire pour valider le produit (par exemple changement clavier + Push entre deux scènes, puis via Follow Action) ?
18. Quels essais techniques de Push 2 et de gestion CPU devons-nous faire **avant** de choisir la structure du device ?
19. Quels critères mesurables permettraient de dire qu'une première version est utilisable en répétition puis en concert ?

## Prochaine séance proposée

**Prochaine décision :** préciser les devices visés par la commande d'activation des pistes (instrument seul, chaîne complète ou sélection de devices), notamment pour éviter d'interrompre des effets en cours. Le Mute et le volume audio sont exclus de la V1 (D-018).

Aucune réponse ci-dessus n'est présumée acquise.
