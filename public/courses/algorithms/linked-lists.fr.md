# Comment fonctionnent les listes chaînées

> Objectifs : comprendre le principe d'une liste chaînée, en écrire une en C, et la comparer à un tableau.

## Le principe

Une liste chaînée est composée de **nœuds** dispersés en mémoire. Chaque nœud contient une valeur et un **pointeur** vers le nœud suivant. Le dernier nœud pointe vers `NULL`. On ne conserve que l'adresse du premier nœud, la **tête**.

```c
typedef struct Node {
    int value;
    struct Node *next;
} Node;
```

Contrairement à un tableau, les nœuds ne sont pas côte à côte : pour atteindre le 4e élément, on suit les pointeurs depuis la tête.

## Insérer en tête en O(1)

Insérer au début ne demande aucun décalage : on crée un nœud et on le relie devant l'ancienne tête.

```c
Node *push_front(Node *head, int value) {
    Node *node = malloc(sizeof *node);
    if (node == NULL) return head;       /* mémoire insuffisante */
    node->value = value;
    node->next = head;
    return node;                         /* la nouvelle tête */
}
```

## Parcourir et rechercher en O(n)

```c
Node *find(Node *head, int value) {
    for (Node *node = head; node != NULL; node = node->next) {
        if (node->value == value) return node;
    }
    return NULL;
}
```

Il n'y a pas d'accès direct : atteindre le i-ème élément coûte O(i).

## Supprimer un nœud

Pour supprimer le nœud qui suit un nœud `prev`, on modifie un seul pointeur puis on libère la mémoire :

```c
void remove_after(Node *prev) {
    Node *target = prev->next;
    if (target == NULL) return;
    prev->next = target->next;
    free(target);
}
```

Si vous détenez déjà un pointeur vers l'endroit de l'opération, la suppression est en O(1) : rien n'est décalé. Mais pour **trouver** cet endroit, il faut d'abord parcourir la liste.

## Tableau ou liste chaînée ?

| | Tableau | Liste chaînée |
|---|---|---|
| Accès au i-ème élément | O(1) | O(i) |
| Insertion en tête | O(n) | O(1) |
| Insertion ou suppression à un endroit déjà atteint | O(n) | O(1) |
| Mémoire | compacte | un pointeur supplémentaire par élément |
| Parcours | rapide (cases contiguës) | plus lent (nœuds dispersés) |

En pratique, les tableaux sont souvent plus rapides qu'on ne le pense, car une mémoire contiguë convient bien au cache du processeur. Une liste chaînée a du sens lorsque vous insérez et supprimez fréquemment en tête ou à des endroits que vous détenez déjà.

Erreurs courantes : oublier de faire `free` sur les nœuds supprimés, ce qui provoque une **fuite de mémoire**, et utiliser un nœud après l'avoir libéré, ce qui est un comportement indéfini.

## À retenir : les listes chaînées

- Un nœud = une valeur + un pointeur vers le suivant ; on conserve la tête.
- Insertion en tête en O(1) ; recherche et accès par position en O(n).
- Chaque suppression doit libérer la mémoire, et plus rien ne doit être utilisé ensuite.

```quiz
Quelle opération est en O(1) sur une liste simplement chaînée (la tête étant connue) ?
- [ ] Lire le dernier élément
- [x] Insérer un élément en première position
- [ ] Rechercher une valeur
- [ ] Lire l'élément d'indice i
> On relie un nouveau nœud devant la tête : quelques affectations, quelle que soit la taille.
```

```quiz
Que se passe-t-il si vous supprimez un nœud sans appeler `free` ?
- [ ] Rien, la mémoire est récupérée automatiquement en C
- [x] Une fuite de mémoire : la mémoire reste réservée
- [ ] Le programme s'arrête immédiatement
> Le C n'a pas de ramasse-miettes : la mémoire allouée avec `malloc` doit être libérée par le programmeur.
```
