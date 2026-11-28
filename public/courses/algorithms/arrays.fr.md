# Travailler avec les tableaux

> Objectifs : comprendre comment un tableau est organisé en mémoire, et connaître le coût de ses opérations.

## Qu'est-ce qu'un tableau ?

Un tableau est une séquence d'éléments **du même type** stockés les uns après les autres en mémoire. Chaque élément possède un **indice**, qui commence à 0.

```c
int scores[5] = {12, 15, 9, 18, 14};
printf("%d\n", scores[3]);   /* affiche 18 */
```

## Accès direct en O(1)

Comme les éléments sont contigus et de même taille, l'adresse de `scores[i]` se calcule directement : adresse de départ + i × taille d'un élément. Lire la case 0 ou la case 4 000 000 coûte la même chose, donc l'accès est en O(1).

C'est le grand atout des tableaux.

## Coût des opérations

| Opération | Complexité | Pourquoi |
|---|---|---|
| Lire ou écrire `a[i]` | O(1) | calcul d'adresse |
| Parcourir tous les éléments | O(n) | une étape par case |
| Rechercher une valeur (non trié) | O(n) | pire cas : elle est absente |
| Insérer au milieu | O(n) | les éléments suivants doivent être décalés |
| Supprimer au milieu | O(n) | il faut refermer le trou |
| Ajouter à la fin (s'il reste de la place) | O(1) | on écrit dans la prochaine case libre |

Voici l'insertion à une position donnée, qui montre le décalage à l'origine du coût :

```c
/* Insère value à la position pos. Le tableau contient count éléments
   et a de la place pour au moins count + 1. */
void insert_at(int values[], int count, int pos, int value) {
    for (int i = count; i > pos; i--) {
        values[i] = values[i - 1];     /* décalage vers la droite */
    }
    values[pos] = value;
}
```

Insérer en première position décale les n éléments : c'est le pire cas.

## Taille fixe et débordement

En C, la taille d'un tableau est fixée à sa création. Écrire dans `a[n]` ou au-delà est un **débordement de tampon** (buffer overflow) : le programme écrit dans une mémoire qui ne lui appartient pas. Le comportement est indéfini, et c'est une source classique de failles de sécurité. Assurez-vous toujours que `0 <= i < n`.

Pour une taille variable, on alloue dynamiquement et on agrandit au besoin :

```c
typedef struct {
    int *items;
    int count;
    int capacity;
} IntList;

int list_append(IntList *list, int value) {
    if (list->count == list->capacity) {
        int new_capacity = list->capacity == 0 ? 4 : list->capacity * 2;   /* doubler */
        int *grown = realloc(list->items, new_capacity * sizeof *grown);
        if (grown == NULL) return 0;                                       /* mémoire insuffisante */
        list->items = grown;
        list->capacity = new_capacity;
    }
    list->items[list->count++] = value;
    return 1;
}
```

Doubler la capacité à chaque fois rend l'ajout en O(1) en moyenne (c'est ce qu'on appelle un coût **amorti**), même si un ajout isolé peut coûter O(n) lorsque le tableau est copié.

## À retenir : les tableaux

- Des éléments contigus du même type, indexés à partir de 0.
- L'accès par indice est en O(1) ; l'insertion ou la suppression au milieu est en O(n).
- Ne sortez jamais des bornes `0..n-1`.
- Un tableau dynamique double sa capacité pour garder des ajouts en O(1) amorti.

```quiz
Quelle opération est la plus coûteuse sur un grand tableau ?
- [ ] Lire `a[0]`
- [ ] Écrire `a[n-1]`
- [x] Insérer un élément en première position
- [ ] Lire `a[500]`
> Insérer au début décale les n éléments : O(n). L'accès par indice est en O(1).
```

```quiz
Pourquoi l'accès `a[i]` est-il en O(1) ?
- [x] Les éléments sont contigus et de même taille, donc l'adresse se calcule directement
- [ ] Le tableau est toujours trié
- [ ] L'ordinateur mémorise chaque valeur dans un cache
> adresse = départ + i × taille d'un élément : un seul calcul, quel que soit i.
```

```quiz
Un tableau contient 10 éléments et a de la place pour un de plus. Avec `insert_at`, combien d'éléments sont décalés en insérant à la position 0 ?
- [ ] 0
- [ ] 1
- [ ] 5
- [x] 10
> Chaque élément existant se déplace d'une case vers la droite, soit 10 décalages : c'est le pire cas en O(n).
```

```quiz
Pourquoi un tableau dynamique double-t-il sa capacité au lieu de grandir d'une case à la fois ?
- [ ] Pour accélérer les lectures
- [x] Pour garder des ajouts en O(1) en moyenne (amorti)
- [ ] Pour éviter d'utiliser realloc
- [ ] Pour garder le tableau trié
> Doubler rend les copies coûteuses rares, donc le coût moyen d'un ajout reste constant.
```
