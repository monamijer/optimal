# Introduction aux algorithmes

> Objectifs : dire ce qu'est un algorithme, pourquoi on les compare, et comment ce cours est organisé.

## Qu'est-ce qu'un algorithme ?

Un algorithme est une suite précise d'étapes qui transforme des données d'entrée en un résultat. Une recette de cuisine en est un : les ingrédients sont l'entrée, le plat est la sortie, et chaque étape est sans ambiguïté.

Les algorithmes sont au cœur de l'informatique. Trier vos contacts, trouver l'itinéraire le plus court sur une carte, compresser une photo ou vérifier un mot de passe reposent tous sur des algorithmes.

Un bon algorithme est :

- **correct** : il donne le bon résultat pour toute entrée attendue ;
- **fini** : il s'arrête toujours ;
- **efficace** : il utilise une quantité raisonnable de temps et de mémoire.

## Un premier exemple : trouver le plus grand nombre

Le problème : trouver le plus grand élément d'un tableau d'entiers. L'idée tient en trois phrases. On garde le premier élément comme « meilleur candidat », on regarde les autres un par un, et dès que l'un d'eux est plus grand, il devient le nouveau candidat.

```c
int find_max(const int values[], int count) {
    int best = values[0];
    for (int i = 1; i < count; i++) {
        if (values[i] > best) {
            best = values[i];
        }
    }
    return best;
}
```

Chaque élément est lu exactement une fois. Avec 10 éléments, on fait 9 comparaisons ; avec 1,000,000 d'éléments, on en fait 999,999. Le travail croît proportionnellement à la taille des données. C'est le point de départ de la notion de complexité, abordée au chapitre suivant.

## Pourquoi les algorithmes comptent

Ils nous permettent de résoudre des problèmes efficacement. Sur de petites entrées, presque tous les algorithmes sont assez rapides. Sur de grandes entrées, la différence entre deux méthodes peut être la différence entre une seconde et plusieurs jours.

Choisir la bonne **structure de données** (la façon dont l'information est stockée) compte autant que choisir le bon algorithme. Un même problème peut être facile ou pénible selon la manière dont les données sont organisées.

## Organisation de ce cours

1. **La complexité**, pour comparer les algorithmes.
2. **Les structures de données** : tableaux, listes chaînées, piles et files.
3. **Les algorithmes classiques** : recherche, tri et récursivité.

Chaque chapitre se termine par des points clés et un quiz. Les exemples sont écrits en C. Si vous connaissez les variables, les boucles et les fonctions, vous avez le bagage nécessaire.

## Points clés : introduction

- Un algorithme transforme une entrée en sortie par des étapes précises.
- On juge un algorithme sur sa correction, sa terminaison et son efficacité.
- La structure de données que vous choisissez influence directement l'efficacité.

```quiz
Laquelle de ces qualités n'est PAS attendue d'un algorithme ?
- [ ] Il est correct
- [ ] Il se termine
- [x] Il est écrit en C
- [ ] Il est raisonnablement efficace
> Un algorithme est indépendant du langage : il peut être écrit en C, en Python ou en français courant.
```

```quiz
Avec `find_max`, combien de comparaisons sont faites sur un tableau de 1 000 éléments ?
- [ ] 1 000
- [ ] 500
- [x] 999
- [ ] 10
> Le premier élément est le candidat de départ, puis chacun des 999 autres éléments est comparé une fois.
```

```quiz
À quoi renvoie le terme « structure de données » ?
- [ ] Le langage de programmation utilisé
- [x] La manière dont l'information est stockée et organisée
- [ ] Le résultat renvoyé par un algorithme
- [ ] Le nombre d'étapes d'un algorithme
> Une structure de données est la façon d'organiser les données en mémoire, et elle influence directement l'efficacité des algorithmes qui l'utilisent.
```

```quiz
Une procédure donne le bon résultat quand elle s'arrête, mais sur certaines entrées elle boucle indéfiniment. Quelle qualité manque ?
- [ ] La correction
- [ ] L'efficacité
- [ ] Elle est écrite en C
- [x] La finitude
> Un algorithme doit toujours s'arrêter (être fini) ; une procédure qui peut boucler indéfiniment n'est pas un algorithme valide.
```
