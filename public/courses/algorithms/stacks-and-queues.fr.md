# Piles (LIFO) et files (FIFO)

> Objectifs : distinguer une pile d'une file, connaître leurs usages et les implémenter.

## Piles : dernier entré, premier sorti

Une **pile** fonctionne comme une pile d'assiettes : on ajoute et on retire toujours au sommet. Le dernier élément ajouté est le premier retiré. C'est le principe **LIFO** (*Last In, First Out*).

Opérations :

- `push(x)` : ajouter x au sommet ;
- `pop()` : retirer et renvoyer le sommet ;
- `peek()` : lire le sommet sans le retirer ;
- `is_empty()`.

Toutes sont en O(1).

### Implémentation avec un tableau

```c
#define CAPACITY 100

typedef struct {
    int items[CAPACITY];
    int size;
} Stack;

void stack_init(Stack *s)          { s->size = 0; }
int  stack_is_empty(const Stack *s) { return s->size == 0; }

int push(Stack *s, int value) {
    if (s->size == CAPACITY) return 0;    /* la pile est pleine */
    s->items[s->size++] = value;
    return 1;
}

int pop(Stack *s, int *value) {
    if (stack_is_empty(s)) return 0;       /* la pile est vide */
    *value = s->items[--s->size];
    return 1;
}
```

### Usages courants des piles

- le bouton « Annuler » d'un éditeur ;
- la pile d'appels de fonctions (voir le chapitre sur la récursivité) ;
- la vérification des parenthèses : on empile chaque `(` et on dépile à chaque `)` ; l'expression est bien parenthésée si la pile est vide à la fin et n'a jamais été dépilée alors qu'elle était vide.

## Files : premier entré, premier sorti

Une **file** fonctionne comme une file d'attente : le premier arrivé est le premier servi. C'est le principe **FIFO** (*First In, First Out*).

- `enqueue(x)` : ajouter x à l'arrière ;
- `dequeue()` : retirer et renvoyer l'élément de tête.

Avec une liste chaînée qui conserve un pointeur vers la tête **et** vers la queue, les deux opérations sont en O(1). Avec un tableau, utilisez un **tampon circulaire** : les indices de début et de fin reviennent à 0 après la dernière case (`(i + 1) % CAPACITY`), ce qui évite de décaler les éléments à chaque retrait.

### Usages courants des files

- une file d'impression ;
- les messages en attente dans un serveur ;
- le parcours en largeur d'un graphe.

## Pile ou file ?

| | Pile | File |
|---|---|---|
| Ordre de sortie | du plus récent au plus ancien | du plus ancien au plus récent |
| Principe | LIFO | FIFO |
| Exemple | annuler une action | attendre à un guichet |

## À retenir : piles et files

- Pile = LIFO, file = FIFO ; leurs opérations de base sont en O(1).
- Une pile s'implémente simplement avec un tableau, une file avec une liste chaînée ou un tampon circulaire.
- Testez toujours « vide » avant de retirer et « plein » avant d'ajouter.

```quiz
Vous empilez 1, 2, 3 sur une pile, puis vous dépilez une fois. Quelle valeur obtenez-vous ?
- [ ] 1
- [ ] 2
- [x] 3
- [ ] On ne peut pas le savoir
> LIFO : le dernier élément empilé (3) est le premier retiré.
```

```quiz
Vous enfilez 1, 2, 3 dans une file, puis vous défilez une fois. Quelle valeur obtenez-vous ?
- [x] 1
- [ ] 2
- [ ] 3
> FIFO : le premier élément enfilé (1) sort en premier.
```
