# Complexité algorithmique

> Objectifs : mesurer le coût d'un algorithme sans le chronométrer, et lire une notation O(...).

## Pourquoi mesurer la complexité

La complexité mesure la performance d'un algorithme. Chronométrer un programme dépend de la machine, du langage et de la charge du moment. On préfère compter combien d'opérations l'algorithme effectue en fonction de la taille **n** des données.

### Complexité temporelle

Elle mesure le temps d'exécution, c'est-à-dire le nombre d'opérations élémentaires (comparaison, addition, accès à une case) en fonction de n.

Reprenons la recherche du maximum : une boucle de n − 1 comparaisons. Si n double, le travail double. On dit que la complexité est **linéaire** et on écrit O(n).

Pour fixer les idées, prenons un annuaire de 1 000 000 de noms classés par ordre alphabétique. Lire les noms un par un demande jusqu'à 1 000 000 d'étapes. En ouvrant au milieu et en écartant la moitié à chaque fois, 20 étapes suffisent : c'est la recherche dichotomique, vue plus loin dans ce cours.

### Complexité spatiale

Elle mesure la mémoire utilisée en plus des données d'entrée. La fonction `maximum` n'utilise que deux variables, quelle que soit la taille du tableau : sa complexité spatiale est constante, O(1). Un algorithme qui recopie le tableau pour le trier utilise en revanche O(n) de mémoire supplémentaire.

## La notation O (« grand O »)

La notation O(f(n)) donne un **ordre de grandeur** de la croissance du coût quand n devient grand. On ignore les constantes et les termes secondaires : 3n + 10 s'écrit O(n), et n² + 5n + 2 s'écrit O(n²).

| Complexité | Nom | Exemple |
|---|---|---|
| O(1) | constante | lire la case `t[i]` d'un tableau |
| O(log n) | logarithmique | recherche dichotomique |
| O(n) | linéaire | parcourir un tableau |
| O(n log n) | quasi-linéaire | tri fusion |
| O(n²) | quadratique | deux boucles imbriquées sur n éléments |
| O(2ⁿ) | exponentielle | tester tous les sous-ensembles |

Avec n = 1 000 000 et une machine qui fait un milliard d'opérations par seconde, un algorithme en O(n) prend un millième de seconde, en O(n²) environ 17 minutes, et en O(2ⁿ) plus que l'âge de l'univers.

### Pire cas, meilleur cas

La complexité dépend parfois des données elles-mêmes. Chercher une valeur dans un tableau non trié : si elle est en première position, une comparaison suffit (meilleur cas) ; si elle est absente, il faut tout parcourir (pire cas). Sauf précision contraire, on annonce la complexité du **pire cas**, car c'est la garantie que l'on peut donner.

## À retenir : complexité

- On compte les opérations en fonction de n, on ne chronomètre pas.
- O(...) ne garde que le terme dominant et ignore les constantes.
- L'ordre à connaître : O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).
- On annonce en général le pire cas.

```quiz
Une fonction contient deux boucles imbriquées, chacune parcourant les n éléments d'un tableau. Quelle est sa complexité temporelle ?
- [ ] O(n)
- [ ] O(2n)
- [x] O(n²)
- [ ] O(log n)
> n × n opérations : la complexité est quadratique.
```

```quiz
Que représente n dans O(n) ?
- [ ] Le nombre de lignes de code
- [x] La taille des données en entrée
- [ ] Le temps en secondes
> La complexité décrit comment le coût grandit avec la taille des données.
```
