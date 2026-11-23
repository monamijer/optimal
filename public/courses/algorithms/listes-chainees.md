# Les listes chaînées

> Objectifs : comprendre le principe d'une liste chaînée, l'écrire en C, et la comparer au tableau.

## Principe

Une liste chaînée est formée de **maillons** (ou nœuds) éparpillés en mémoire. Chaque maillon contient une valeur et un **pointeur** vers le maillon suivant. Le dernier pointe vers `NULL`. On ne conserve que l'adresse du premier maillon, la **tête**.

```c
typedef struct Maillon {
    int valeur;
    struct Maillon *suivant;
} Maillon;
```

Contrairement au tableau, les maillons ne sont pas côte à côte : pour atteindre le 4ᵉ élément, il faut suivre les pointeurs depuis la tête.

## Insérer en tête en O(1)

Insérer au début ne demande aucun décalage : on crée un maillon et on le branche devant l'ancienne tête.

```c
Maillon *ajouter_en_tete(Maillon *tete, int valeur) {
    Maillon *m = malloc(sizeof *m);
    if (m == NULL) return tete;          /* mémoire insuffisante */
    m->valeur = valeur;
    m->suivant = tete;
    return m;                            /* la nouvelle tête */
}
```

## Parcourir et chercher en O(n)

```c
Maillon *chercher(Maillon *tete, int valeur) {
    for (Maillon *m = tete; m != NULL; m = m->suivant) {
        if (m->valeur == valeur) return m;
    }
    return NULL;
}
```

Il n'y a pas d'accès direct : atteindre le i-ᵉ élément coûte O(i).

## Supprimer un maillon

Pour supprimer le maillon qui suit un maillon `p`, on modifie un seul pointeur, puis on libère la mémoire :

```c
void supprimer_apres(Maillon *p) {
    Maillon *cible = p->suivant;
    if (cible == NULL) return;
    p->suivant = cible->suivant;
    free(cible);
}
```

Si l'on tient déjà un pointeur sur l'endroit de l'opération, la suppression est en O(1) : aucun décalage. Mais pour **trouver** cet endroit, il faut d'abord parcourir la liste.

## Tableau ou liste chaînée ?

| | Tableau | Liste chaînée |
|---|---|---|
| Accès au i-ᵉ élément | O(1) | O(i) |
| Insertion en tête | O(n) | O(1) |
| Insertion/suppression à un endroit déjà atteint | O(n) | O(1) |
| Mémoire | compacte | un pointeur de plus par élément |
| Parcours | rapide (cases contiguës) | plus lent (maillons dispersés) |

En pratique, les tableaux sont souvent plus rapides qu'on ne le croit grâce à la contiguïté en mémoire. La liste chaînée est pertinente quand on insère et supprime souvent au début ou à des endroits déjà connus.

Une erreur fréquente : oublier de libérer (`free`) les maillons supprimés, ce qui provoque une **fuite de mémoire**, ou utiliser un maillon après l'avoir libéré, ce qui est un comportement indéfini.

## À retenir : listes chaînées

- Un maillon = une valeur + un pointeur vers le suivant ; on garde la tête.
- Insertion en tête en O(1) ; recherche et accès par position en O(n).
- Toute suppression doit libérer la mémoire (`free`), et rien ne doit être utilisé après.

```quiz
Quelle opération est en O(1) sur une liste chaînée simple (avec accès à la tête) ?
- [ ] Lire le dernier élément
- [x] Insérer un élément en première position
- [ ] Chercher une valeur
- [ ] Lire l'élément d'indice i
> On branche un nouveau maillon devant la tête : quelques affectations, quelle que soit la taille.
```

```quiz
Que se passe-t-il si on supprime un maillon sans appeler `free` ?
- [ ] Rien, la mémoire est récupérée automatiquement en C
- [x] Une fuite de mémoire : la mémoire reste réservée
- [ ] Le programme s'arrête immédiatement
> Le C n'a pas de ramasse-miettes : la mémoire allouée avec `malloc` doit être libérée par le programmeur.
```
