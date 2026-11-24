# Ajouter ou compléter un cours

Optimal n'a pas encore d'éditeur dans l'application (voir `docs/ROADMAP.md`, phase 5). Les cours sont des fichiers Markdown dans `public/courses/`. Ce guide décrit le chemin le plus court pour en ajouter un.

## En 4 commandes

```bash
npm run course:new -- structures_de_donnees "Structures de données" --category "Informatique fondamentale"
npm run course:chapter -- structures_de_donnees piles.md "Les piles"
# éditez les fichiers .md et course.json, puis :
npm run catalog        # régénère public/courses/catalog.json et signale les chapitres vides
npm start              # relisez le résultat dans le navigateur
```

Puis : branche, commit (n'oubliez pas `public/courses/catalog.json`), pull request.

Options de `course:new` : `--premium` (cours réservé aux membres), `--icon bi-xxx` (une icône de [Bootstrap Icons](https://icons.getbootstrap.com/)), `--lang en|fr` (langue du modèle de chapitre, `en` par défaut).

**Convention : le contenu des cours et le code sont écrits en anglais** (accessible, international ; pas d'identifiants en français dans le code). L'interface du site reste en français.

## Ce qui compose un cours

```
public/courses/<id>/
  course.json        métadonnées et ordre des chapitres
  introduction.md    un fichier par chapitre
  sorting.md
```

`course.json` :

| Champ | Rôle |
|---|---|
| `title` | Titre affiché |
| `category` | Regroupe les cours dans le menu et le catalogue |
| `icon` | Icône Bootstrap Icons |
| `accessLevel` | `free` ou `premium` |
| `description` | Une phrase : ce que le lecteur saura faire après le cours |
| `tags` | Niveau, technologies |
| `chapters` | Fichiers `.md`, **dans l'ordre de lecture** |

L'`id` (nom du dossier) : minuscules, chiffres et `_`. Il apparaît dans l'URL (`/courses/<id>`) : ne le changez pas après publication.

## Écrire un chapitre

- Un seul `#` (titre du chapitre) par fichier, puis des `##` et `###`. Ils alimentent la table des matières, la recherche et les liens vers un passage.
- **Chaque titre doit être unique dans tout le cours** (tous les chapitres s'affichent sur une même page : « Key takeaways » deux fois rendrait les liens et la recherche ambigus). Écrivez « Key takeaways: sorting ». De même, le titre `#` ne doit pas avoir le même identifiant que le nom du fichier (`sorting.md` et `# Sorting` entrent en conflit : écrivez `# Sorting algorithms`). `npm run catalog` signale les deux cas.
- Commencez par l'objectif du chapitre, finissez par « À retenir » et un quiz.
- Une idée par paragraphe, un exemple avant la définition quand c'est possible.
- Le code va dans des blocs avec le langage (`` ```c ``, `` ```js ``).
- Un chapitre de moins de 50 mots est signalé comme à compléter par `npm run catalog`.

## Quiz dans un chapitre

````markdown
```quiz
Quelle est la complexité de la recherche dichotomique ?
- [ ] O(n)
- [x] O(log n)
- [ ] O(n²)
> À chaque comparaison, la moitié des éléments est écartée.
```
````

- Une seule `[x]` : boutons radio. Plusieurs `[x]` : cases à cocher.
- La ligne `>` (explication) est facultative.
- Un quiz mal formé (pas de bonne réponse, moins de 2 choix) reste affiché comme un bloc de code : vous le verrez tout de suite en relisant.
- Le résultat n'est pas encore conservé après la lecture (prévu avec les révisions espacées).

## Ce qui est interdit ou ignoré

- Le HTML du Markdown est nettoyé par DOMPurify : les scripts et gestionnaires d'événements sont supprimés. Ne contournez pas ce mécanisme.
- Changer le texte d'un passage que des lecteurs ont surligné retire son surlignage dans le cours (il reste dans leur carnet).

## Vérifications avant la pull request

```bash
npm run catalog:check   # le catalogue commité est à jour
npm run test:scripts    # les outils de cours
npm test                # tests de l'application
```

## Plus tard

Un éditeur dans l'application (aperçu Markdown, import/export de « paquets de cours ») est prévu en phase 5. Tant qu'il n'existe pas, ce flux fichiers + pull request est la méthode.
