# La recherche

> Objectifs : écrire la recherche linéaire et la recherche dichotomique, et savoir quand utiliser l'une ou l'autre.

## Recherche linéaire

Chercher une valeur dans un tableau non trié n'a pas d'autre solution que de regarder les éléments un par un. La fonction renvoie l'indice trouvé, ou -1.

```c
int recherche_lineaire(const int t[], int n, int x) {
    for (int i = 0; i < n; i++) {
        if (t[i] == x) return i;
    }
    return -1;
}
```

Pire cas : la valeur est absente, il faut faire n comparaisons. La complexité est O(n).

## Recherche dichotomique

Si le tableau est **trié**, on peut faire beaucoup mieux. On compare x à l'élément du milieu :

- s'il est égal, c'est fini ;
- s'il est plus grand que x, on cherche dans la moitié gauche ;
- sinon, dans la moitié droite.

À chaque étape, la moitié des candidats est écartée.

```c
int recherche_dichotomique(const int t[], int n, int x) {
    int debut = 0, fin = n - 1;
    while (debut <= fin) {
        int milieu = debut + (fin - debut) / 2;   /* évite un dépassement de int */
        if (t[milieu] == x)      return milieu;
        else if (t[milieu] < x)  debut = milieu + 1;
        else                     fin = milieu - 1;
    }
    return -1;
}
```

Le calcul `debut + (fin - debut) / 2` plutôt que `(debut + fin) / 2` évite un dépassement de capacité des entiers pour de très grands tableaux.

### Pourquoi O(log n)

Après une étape il reste n/2 candidats, après deux n/4, et ainsi de suite. On s'arrête quand il en reste un, donc après environ log₂(n) étapes.

| Taille du tableau | Recherche linéaire (pire cas) | Recherche dichotomique (pire cas) |
|---|---|---|
| 1 000 | 1 000 comparaisons | environ 10 |
| 1 000 000 | 1 000 000 comparaisons | environ 20 |
| 1 000 000 000 | 1 000 000 000 comparaisons | environ 30 |

C'est ce qui rend un annuaire d'un million de noms triés consultable en 20 étapes au plus.

## Le coût du tri

La recherche dichotomique exige un tableau trié, et trier coûte en général O(n log n). Si l'on cherche **une seule fois**, la recherche linéaire est moins chère. Si l'on cherche **souvent** dans les mêmes données, on trie une fois (voir le chapitre suivant) puis on cherche vite à chaque fois.

Autre limite : la dichotomie suppose l'accès direct à l'élément du milieu, donc un tableau. Sur une liste chaînée, atteindre le milieu coûte O(n) et l'avantage disparaît.

## À retenir : recherche

- Non trié : recherche linéaire, O(n).
- Trié et en tableau : recherche dichotomique, O(log n).
- Trier d'abord n'est rentable que si l'on cherche plusieurs fois.

```quiz
Combien de comparaisons, au plus, faut-il environ pour chercher une valeur par dichotomie dans un tableau trié de 1 000 000 d'éléments ?
- [x] Environ 20
- [ ] Environ 1 000
- [ ] Environ 500 000
- [ ] 1 000 000
> log₂(1 000 000) ≈ 20 : chaque comparaison écarte la moitié des éléments.
```

```quiz
Quelle condition est indispensable pour utiliser la recherche dichotomique ?
- [ ] Le tableau ne contient aucun doublon
- [x] Le tableau est trié
- [ ] Le tableau contient moins de 1 000 éléments
> Sans ordre, comparer au milieu ne permet pas d'écarter une moitié.
```
