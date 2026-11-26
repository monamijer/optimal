# Complexité algorithmique

> Objectifs : mesurer le coût d'un algorithme sans le chronométrer, et lire la notation O(...).

## Pourquoi mesurer la complexité

La complexité mesure l'efficacité d'un algorithme. Le temps d'exécution d'un programme dépend de la machine, du langage et de tout ce qui tourne en même temps. À la place, on compte le nombre d'opérations que l'algorithme effectue en fonction de la taille **n** de l'entrée.

### Complexité en temps

La complexité en temps mesure la durée d'exécution, c'est-à-dire le nombre d'opérations élémentaires (une comparaison, une addition, un accès à un tableau) en fonction de n.

Reprenons la recherche du maximum : une boucle de n − 1 comparaisons. Si n double, le travail double. On dit que la complexité est **linéaire** et on l'écrit O(n).

Pour s'en faire une idée, imaginez un annuaire de 1,000,000 de noms triés par ordre alphabétique. Lire les noms un par un demande jusqu'à 1,000,000 d'étapes. Ouvrir l'annuaire au milieu et écarter la moitié à chaque fois demande au plus 20 étapes. C'est la recherche dichotomique, abordée plus loin dans ce cours.

### Complexité en espace

La complexité en espace mesure la mémoire supplémentaire utilisée en plus de l'entrée. `find_max` utilise deux variables quelle que soit la taille du tableau : sa complexité en espace est constante, O(1). Un algorithme qui copie le tableau pour le trier a besoin de O(n) de mémoire supplémentaire.

## Notation grand O

O(f(n)) donne un **ordre de grandeur** de la croissance du coût lorsque n devient grand. On ignore les constantes et les termes d'ordre inférieur : 3n + 10 est O(n), et n² + 5n + 2 est O(n²).

| Complexité | Nom | Exemple |
|---|---|---|
| O(1) | constante | lire la case `a[i]` d'un tableau |
| O(log n) | logarithmique | recherche dichotomique |
| O(n) | linéaire | parcourir un tableau |
| O(n log n) | linéarithmique | tri fusion |
| O(n²) | quadratique | deux boucles imbriquées sur n éléments |
| O(2ⁿ) | exponentielle | essayer tous les sous-ensembles |

Avec n = 1,000,000 et une machine qui exécute un milliard d'opérations par seconde, un algorithme en O(n) prend un millième de seconde, un algorithme en O(n²) environ 17 minutes, et un algorithme en O(2ⁿ) plus longtemps que l'âge de l'univers.

### Pire cas et meilleur cas

La complexité dépend parfois des données elles-mêmes. Cherchons une valeur dans un tableau non trié : si elle est en première position, une seule comparaison suffit (meilleur cas) ; si elle est absente, il faut vérifier chaque élément (pire cas). Sauf indication contraire, on donne le **pire cas**, car c'est la garantie que l'on peut offrir.

## Points clés : complexité

- On compte les opérations en fonction de n ; on ne chronomètre pas le programme.
- O(...) garde le terme dominant et ignore les constantes.
- L'ordre à connaître : O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).
- On donne généralement le pire cas.

```quiz
Une fonction contient deux boucles imbriquées, chacune parcourant les n éléments d'un tableau. Quelle est sa complexité en temps ?
- [ ] O(n)
- [ ] O(2n)
- [x] O(n²)
- [ ] O(log n)
> n × n opérations : la complexité est quadratique.
```

```quiz
Que représente n dans O(n) ?
- [ ] Le nombre de lignes de code
- [x] La taille de l'entrée
- [ ] Le temps d'exécution en secondes
> La complexité décrit comment le coût croît avec la taille de l'entrée.
```
