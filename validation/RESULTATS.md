# Validation V1.5-EN — traduction anglaise uniquement

## Périmètre

Traduction directe des chaînes existantes, sans système multilingue ni fichier de traduction à l’exécution : compact (**OPEN CONFIGURATIONS**), activité (**ACTIVE**), boutons (**+ ADD / DUPLICATE / DELETE**), colonne **MORE**, panneau JavaScript vide (**No configuration**), absence de sélection PUSH (**None**) et diagnostic **ambiguous**. ROOT/SCALE/PUSH et les valeurs des gammes gardent leurs noms techniques existants.

Les statuts, avertissements, erreurs de validation et logs KLJ sont en anglais, notamment **Unknown clip: … — No action taken**, **Configuration applied**, **Ready — waiting for next clip**, diagnostics de pistes et **JavaScript error**. Les expressions de classification des statuts suivent les nouveaux textes pour conserver le comportement du bandeau.

Seuls les noms proposés pour les nouvelles créations/copies changent : NEW_CLIP et suffixe _COPY. Aucune traduction ou recherche/remplacement des noms utilisateur enregistrés. Les messages produits par un script utilisateur ou par Max/Live restent ceux de leur auteur ; seul le préfixe KLJ est traduit.

## Préservation

La comparaison aux sources V1.5 avant traduction montre que les quatre JavaScript ne changent qu’en contenu de chaînes et, dans la vue, dans les deux expressions de reconnaissance des statuts traduits. Aucune instruction, condition musicale, clé, référence LiveAPI ou identité interne modifiée. Rapport `translation-v1.5-en.json`.

Le patch complet, comparé hors attributs text/texton, est identique : dimensions, présentation, couleurs, attributs, connexions, grilles synchronisées et paramètres de persistance inchangés. Aucun ajustement de taille nécessaire. Schéma version 1 et paramètre Blob KLJ Configurations conservés.

## Résultats

- **45 tests Node réussis** : les 42 tests existants passent après adaptation de leurs attentes textuelles ; trois tests ajoutés vérifient la restauration exacte d’un état français (noms, scripts avec accents, clés, valeurs et JSON stocké), la classification des statuts anglais et les nouveaux noms générés sans modification des anciens.
- **23 contrôles natifs Max réussis**, rapport `native-v1.5-en.json` : vrais objets v8, jit.cellblock et menus, ROOT/SCALE/PUSH, conservation des données et du champ historique pushMode, texte multiligne avec accents, pattr, évaluation JavaScript et erreur suivie d’une exécution valide.
- **Rendu vérifié dans Max 9.1.5 intégré**, accessible via Live 12.4.16 : ACTIVE, avertissement anglais complet, + ADD/DUPLICATE/DELETE/JAVASCRIPT et titre du panneau lisibles ; réduction de fenêtre et défilement horizontal avec CLIP figé, MORE visible et sélecteur PUSH affichant None ; compact du banc affichant le titre V1.5-EN et OPEN CONFIGURATIONS sans troncature. Ce banc est indépendant et ne commande pas Live. Rapport d’événements `mouse-v1.5-en.json`.
- Recherche de fragments français dans les quatre sources de production et les libellés du générateur : aucun texte français d’interface restant détecté. Les tests contiennent volontairement du français pour prouver sa préservation dans les données/scripts.
- Source et AMXD contrôlés : texte anglais du compact, titre et boutons, éditeur embarqué identique au source, synchronisation et cordons conservés, paramètre Blob / Stored Only inchangé, quatre JS adjacents et état livré vide. Archive et manifeste SHA-256 vérifiés.

## Livraison et essai restant

AMXD MIDI V1.5-EN et sources correspondantes. L’AMXD met à jour le chunk ptch du conteneur MIDI natif utilisé par les livraisons précédentes ; ce n’est pas un JSON renommé. Aucun nouveau Save As lié à Live ni chargement musical du nouvel AMXD dans le Set n’est revendiqué. L’ancien device V1.5 a seulement servi à ouvrir Max ; le Set utilisateur n’a pas été édité ou sauvegardé par les bancs.

Faire l’essai court de LIVE_TESTS.md : rendu final dans Live, menus, noms français conservés et sauvegarde/réouverture `.als`. Aucun test matériel Push 2 supplémentaire revendiqué. Aucune publication GitHub, réorganisation ou opération de nettoyage du dépôt effectuée.
