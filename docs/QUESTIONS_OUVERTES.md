# Discovery — questions ouvertes

**Statut : exploration, pas un backlog de développement.**

L'ordre ci-dessous constitue une proposition de discussion, **pas** une priorité produit officiellement validée. Chaque question devra mener soit à une décision documentée, soit à un test technique ciblé.

## A. Parcours et configurations

1. **Résolu par D-012/D-014 :** une configuration est complète et le tableau comporte toutes les pistes audio et MIDI. Reste à définir les réglages exacts de chaque colonne et leur comportement.
2. Comment rendre la duplication d'une configuration complète rapide, même lorsqu'on ne modifie qu'un BPM ou l'état d'un effet ?
3. Que doit-il se passer si un clip déclencheur est lancé une seconde fois, s'il est inconnu, ou si sa configuration fait référence à une piste disparue ?
4. **D-028 — tranché :** noms des clips sans marqueurs ClyphX, convention recommandée `MAJUSCULES_ET_UNDERSCORES`, correspondance exacte au nom de la ligne. Un clip inconnu doit rester sans effet et produire un diagnostic non bloquant.

**D-025 — validé :** chaque configuration possède un champ facultatif de JavaScript avancé, sans éditeur graphique spécifique True Peak.

**D-026 — tranché :** JavaScript natif Max (`v8` / `LiveAPI`) ; aucun langage propriétaire. Reste à tester l'évaluation dynamique de chaînes, la persistance et les erreurs.

**D-027 — installation validée :** device sur la piste des clips déclencheurs. Une boucle naturelle ne relance pas la configuration ; une transition réelle oui. Tester `Play Again` et les relances du même slot.

## B. Instruments et contrôleurs

5. **Orientation D-022 à valider :** le routage MIDI et Monitor IN restent préconfigurés dans Live ; le plugin n'écrit plus MON OFF / MON IN. **Test requis :** s'assurer que le clavier ne joue que ses pistes actives, et que Push ne joue que sa piste sélectionnée, même quand le changement est déclenché par l'API Live plutôt que par une touche de Push.
6. Pour Breathe, faut-il toujours faire jouer deux instruments simultanément avec le clavier, sans split de notes, ou y a-t-il des cas particuliers ?
7. **D-010/D-020 :** sélectionner la piste destinée à Push est indispensable (équivalent `14/SEL`). Vérifier sur le matériel que sélection dans Live + réglages existants rendent immédiatement l'instrument jouable, sans gestion d'ARM ajoutée.
8. **À vérifier techniquement** : quels comportements Push 2 sont réalisables de façon fiable avec Live 12 / Max for Live sans ancien Remote Script ? Tester notamment le « 64 pads » ; le résultat ne doit pas bloquer la V1.

## C. CPU, continuité sonore et stabilité

**Décision prise (D-011) : gestion automatique des instruments inutilisés en V1, avec protections audio.** Ce choix ne préjuge pas du mécanisme Max for Live.

9. **D-019 : la grille ON/OFF pilote Track Activator, non Device On/Off** ; ce réglage ne garantit pas une baisse CPU. Quelle réduction réelle obtient-on sur les instruments utilisés par KLJ ? Des mesures sont nécessaires avant de promettre une optimisation CPU.
10. À quel moment peut-on couper un device sans couper une note tenue, une réverbération ou une transition ? Faut-il différer l'arrêt / réactiver avant l'utilisation ?
11. Quel compromis accepte-t-on entre économie CPU, latence de réactivation et continuité sonore ? Comment définit-on « instrument inutilisé » dans le périmètre d'une configuration complète ?
12. **D-018 maintenue :** volumes et activation/Mute des stems audio restent contrôlés manuellement via APC ; le gestionnaire ne doit pas les modifier au cours du live KLJ. Les éventuels effets pilotés séparément restent à définir.

## D. Maintenance et interface

13. **D-024/D-031 — choix validés :** nouvelle piste MIDI = nouvelle colonne OFF ; ordre de colonnes calqué sur l'ordre Live et en-tête `numéro — nom`. Les pistes instrumentales portent des noms uniques. **D-032 :** lors d'une suppression, effacer immédiatement la colonne et ses états, sans colonne fantôme ; une piste recréée repart OFF. Tester la distinction suppression / déplacement / renommage et les cas ambigus, sans assistant complexe.
14. La représentation par colonnes de pistes est validée (D-014). Comment afficher clairement activation des pistes audio/MIDI, armement MIDI, Push, tempo et devices ?
15. **D-029/D-030 — résolu en produit :** duplication indépendante si simple, stockage complet avec le Live Set (`.als`), sans fichier externe. **À valider en PoC :** restauration exacte après sauvegarde, fermeture et réouverture, y compris scripts JavaScript multilignes. L'export/import dédié n'est pas requis en V1.
16. Comment vérifier avant concert qu'aucun déclencheur ne référence un instrument introuvable ?

## E. Validation progressive

17. Quel est le **premier parcours complet** à reproduire pour valider le produit (par exemple changement clavier + Push entre deux scènes, puis via Follow Action) ?
18. Quels essais techniques de Push 2 et de gestion CPU devons-nous faire **avant** de choisir la structure du device ?
19. Quels critères mesurables permettraient de dire qu'une première version est utilisable en répétition puis en concert ?

## Prochaine séance proposée

**Prochaine discussion :** tester ou spécifier le mécanisme d'exécution dynamique de **JavaScript Max natif** dans un champ éditable, puis préciser l'ordre d'exécution et la gestion d'erreurs. La politique des colonnes basée sur numéro affiché + nom est arrêtée en D-031 ; restent les tests de renommage et de pistes manquantes. Le monitoring fixe IN reste une orientation sous réserve du test D-022 ; aucune complexité n'est ajoutée au plugin tant que le test n'en prouve pas la nécessité.

Aucune réponse ci-dessus n'est présumée acquise.
