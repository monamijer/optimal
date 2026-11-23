# Les piles et les files

> Objectifs : distinguer une pile (LIFO) d'une file (FIFO), connaître leurs usages et les implémenter.

## Piles : dernier entré, premier sorti

Une **pile** (stack) fonctionne comme une pile d'assiettes : on pose et on retire toujours au sommet. Le dernier élément ajouté est le premier retiré, c'est le principe **LIFO** (*Last In, First Out*).

Opérations :

- `empiler(x)` : ajoute x au sommet ;
- `depiler()` : retire et renvoie le sommet ;
- `sommet()` : lit le sommet sans le retirer ;
- `est_vide()`.

Toutes sont en O(1).

### Implémentation avec un tableau

```c
#define CAPACITE 100

typedef struct {
    int donnees[CAPACITE];
    int taille;
} Pile;

void pile_init(Pile *p)            { p->taille = 0; }
int  pile_vide(const Pile *p)      { return p->taille == 0; }

int empiler(Pile *p, int x) {
    if (p->taille == CAPACITE) return 0;    /* pile pleine */
    p->donnees[p->taille++] = x;
    return 1;
}

int depiler(Pile *p, int *x) {
    if (pile_vide(p)) return 0;              /* pile vide */
    *x = p->donnees[--p->taille];
    return 1;
}
```

### Usages des piles

- le bouton « Annuler » d'un éditeur ;
- la pile d'appels des fonctions (voir le chapitre sur la récursivité) ;
- la vérification des parenthèses : on empile chaque `(` et on dépile à chaque `)` ; l'expression est bien parenthésée si la pile est vide à la fin et n'a jamais été dépilée à vide.

## Files : premier entré, premier sorti

Une **file** (queue) fonctionne comme une file d'attente : le premier arrivé est le premier servi, c'est le principe **FIFO** (*First In, First Out*).

- `enfiler(x)` : ajoute x à l'arrière ;
- `defiler()` : retire et renvoie l'élément de l'avant.

Avec une liste chaînée qui garde un pointeur sur la tête **et** sur la queue, les deux opérations sont en O(1). Avec un tableau, on utilise un tampon **circulaire** : les indices de début et de fin reviennent à 0 après la dernière case (`(i + 1) % CAPACITE`), ce qui évite de décaler les éléments à chaque retrait.

### Usages des files

- la file d'impression ;
- les messages en attente dans un serveur ;
- le parcours en largeur d'un graphe.

## Pile ou file ?

| | Pile | File |
|---|---|---|
| Ordre de sortie | du plus récent au plus ancien | du plus ancien au plus récent |
| Principe | LIFO | FIFO |
| Exemple | annuler une action | attente à un guichet |

## À retenir : piles et files

- Pile = LIFO, file = FIFO ; leurs opérations de base sont en O(1).
- Une pile s'implémente simplement avec un tableau, une file avec une liste chaînée ou un tampon circulaire.
- Toujours tester « vide » avant de retirer et « pleine » avant d'ajouter.

```quiz
On empile successivement 1, 2, 3 dans une pile, puis on dépile une fois. Quelle valeur obtient-on ?
- [ ] 1
- [ ] 2
- [x] 3
- [ ] On ne peut pas savoir
> LIFO : le dernier élément empilé (3) est le premier retiré.
```

```quiz
On enfile 1, 2, 3 dans une file, puis on défile une fois. Quelle valeur obtient-on ?
- [x] 1
- [ ] 2
- [ ] 3
> FIFO : le premier élément enfilé (1) sort en premier.
```
