# Algorithmes de recherche

> Objectifs : écrire la recherche linéaire et la recherche dichotomique, et savoir laquelle utiliser selon le cas.

## Recherche linéaire

Pour trouver une valeur dans un tableau non trié, la seule option est d'examiner les éléments un par un. La fonction renvoie l'indice où la valeur se trouve, ou -1.

```c
int linear_search(const int values[], int count, int target) {
    for (int i = 0; i < count; i++) {
        if (values[i] == target) return i;
    }
    return -1;
}
```

Pire cas : la valeur est absente et l'on effectue n comparaisons. La complexité est O(n).

## Recherche dichotomique

Si le tableau est **trié**, on peut faire bien mieux. Comparez la cible à l'élément du milieu :

- s'ils sont égaux, c'est terminé ;
- si l'élément du milieu est supérieur à la cible, on cherche dans la moitié gauche ;
- sinon, on cherche dans la moitié droite.

À chaque étape, la moitié des candidats est écartée.

```c
int binary_search(const int values[], int count, int target) {
    int low = 0, high = count - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;   /* évite le dépassement d'entier */
        if (values[mid] == target)      return mid;
        else if (values[mid] < target)  low = mid + 1;
        else                            high = mid - 1;
    }
    return -1;
}
```

Calculer `low + (high - low) / 2` plutôt que `(low + high) / 2` évite un dépassement d'entier sur de très grands tableaux.

### Pourquoi O(log n)

Après une étape il reste n/2 candidats, après deux n/4, et ainsi de suite. On s'arrête quand il n'en reste qu'un, donc après environ log₂(n) étapes.

| Taille du tableau | Recherche linéaire (pire cas) | Recherche dichotomique (pire cas) |
|---|---|---|
| 1 000 | 1 000 comparaisons | environ 10 |
| 1 000 000 | 1 000 000 comparaisons | environ 20 |
| 1 000 000 000 | 1 000 000 000 comparaisons | environ 30 |

C'est pourquoi on peut chercher dans un annuaire trié d'un million de noms en 20 étapes au plus.

## Le coût du tri

La recherche dichotomique exige un tableau trié, et trier coûte généralement O(n log n). Si vous ne cherchez **qu'une seule fois**, la recherche linéaire est moins chère. Si vous cherchez **souvent** dans les mêmes données, triez une fois (voir le chapitre suivant) puis cherchez rapidement à chaque fois.

Autre limite : la recherche dichotomique a besoin d'un accès direct à l'élément du milieu, donc d'un tableau. Dans une liste chaînée, atteindre le milieu coûte O(n) et l'avantage disparaît.

## À retenir : la recherche

- Non trié : recherche linéaire, O(n).
- Trié et stocké dans un tableau : recherche dichotomique, O(log n).
- Trier d'abord n'est rentable que si vous cherchez plusieurs fois.

```quiz
Environ combien de comparaisons la recherche dichotomique nécessite-t-elle, au maximum, dans un tableau trié de 1 000 000 éléments ?
- [x] Environ 20
- [ ] Environ 1 000
- [ ] Environ 500 000
- [ ] 1 000 000
> log₂(1 000 000) ≈ 20 : chaque comparaison écarte la moitié des éléments.
```

```quiz
Quelle condition est nécessaire pour utiliser la recherche dichotomique ?
- [ ] Le tableau ne contient pas de doublons
- [x] Le tableau est trié
- [ ] Le tableau contient moins de 1 000 éléments
> Sans ordre, comparer avec l'élément du milieu ne permet pas d'écarter une moitié.
```

```quiz
La recherche dichotomique cherche 5 dans `{2, 5, 8, 12, 16, 23}`. L'élément du milieu comparé en premier est 8. Que se passe-t-il ensuite ?
- [ ] La recherche continue dans la moitié droite
- [x] La recherche continue dans la moitié gauche
- [ ] La valeur est déclarée absente
- [ ] Tout le tableau est parcouru linéairement
> 5 est plus petit que 8, donc les candidats ne peuvent se trouver que dans la moitié gauche.
```

```quiz
Vous devez chercher une valeur une seule fois dans un tableau non trié de 1 000 000 d'éléments. Quelle approche est la moins coûteuse ?
- [ ] Trier le tableau, puis faire une recherche dichotomique
- [x] Faire une recherche linéaire
- [ ] Faire directement une recherche dichotomique
- [ ] Copier d'abord le tableau
> La recherche linéaire coûte O(n) ; le tri coûte O(n log n), soit plus qu'un seul parcours.
```
