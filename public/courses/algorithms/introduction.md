# Introduction aux algorithmes

> Objectifs : savoir dire ce qu'est un algorithme, pourquoi on les compare, et comment ce cours est organisé.

## Qu'est-ce qu'un algorithme ?

Un algorithme est une suite d'instructions précises qui transforme des données en entrée en un résultat en sortie. Une recette de cuisine en est un : les ingrédients sont l'entrée, le plat est la sortie, et chaque étape est sans ambiguïté.

Les algorithmes sont au cœur de l'informatique : trier une liste de contacts, trouver le chemin le plus court sur une carte, compresser une photo ou vérifier un mot de passe reposent tous sur des algorithmes.

Un bon algorithme est :

- **correct** : il donne le bon résultat pour toutes les entrées prévues ;
- **fini** : il s'arrête toujours ;
- **efficace** : il utilise raisonnablement le temps et la mémoire.

## Un premier exemple : trouver le plus grand nombre

Voici le problème : trouver le plus grand élément d'un tableau d'entiers. L'idée tient en trois phrases : on retient le premier élément comme « meilleur candidat », on regarde les suivants un par un, et dès qu'on en trouve un plus grand, il devient le candidat.

```c
int maximum(const int t[], int n) {
    int meilleur = t[0];
    for (int i = 1; i < n; i++) {
        if (t[i] > meilleur) {
            meilleur = t[i];
        }
    }
    return meilleur;
}
```

On lit chaque élément exactement une fois. Si le tableau contient 10 éléments, on fait 9 comparaisons ; s'il en contient 1 000 000, on en fait 999 999. Le travail grandit en proportion de la taille des données : c'est le point de départ de la notion de complexité, vue au chapitre suivant.

## Pourquoi les algorithmes sont importants

Ils permettent de résoudre des problèmes efficacement. Sur de petites données, presque tous les algorithmes se valent. Sur de grandes données, la différence entre deux méthodes peut être celle entre une seconde et plusieurs jours.

Choisir la bonne **structure de données** (comment on range l'information) compte autant que choisir le bon algorithme : un même problème devient simple ou pénible selon la façon dont les données sont organisées.

## Organisation du cours

1. **La complexité** pour comparer des algorithmes.
2. **Les structures de données** : tableaux, listes chaînées, piles et files.
3. **Les algorithmes classiques** : recherche, tri et récursivité.

Chaque chapitre se termine par des points à retenir et un quiz. Les exemples sont en langage C : si vous connaissez les variables, les boucles et les fonctions, vous avez le bagage nécessaire.

## À retenir : introduction

- Un algorithme transforme une entrée en sortie par des étapes précises.
- On juge un algorithme sur sa correction, sa terminaison et son efficacité.
- La structure de données choisie influence directement l'efficacité.

```quiz
Lequel de ces éléments n'est PAS une qualité attendue d'un algorithme ?
- [ ] Il est correct
- [ ] Il se termine
- [x] Il est écrit en langage C
- [ ] Il est raisonnablement efficace
> Un algorithme est indépendant du langage : on peut l'écrire en C, en Python ou en français.
```
