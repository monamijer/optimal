# Tableaux

> Objectifs : comprendre comment un tableau est rangé en mémoire, et connaître le coût de ses opérations.

## Qu'est-ce qu'un tableau ?

Un tableau est une suite d'éléments **de même type** rangés les uns à la suite des autres en mémoire. Chaque élément a un **indice** qui commence à 0.

```c
int notes[5] = {12, 15, 9, 18, 14};
printf("%d\n", notes[3]);   /* affiche 18 */
```

## Accès direct en O(1)

Comme les éléments sont contigus et de même taille, l'adresse de `notes[i]` se calcule directement : adresse du début + i × taille d'un élément. Lire la case 0 ou la case 4 000 000 coûte donc le même temps : c'est un accès en O(1).

C'est la grande force du tableau.

## Coût des opérations

| Opération | Complexité | Pourquoi |
|---|---|---|
| Lire ou écrire `t[i]` | O(1) | calcul d'adresse |
| Parcourir tous les éléments | O(n) | on visite chaque case |
| Chercher une valeur (non trié) | O(n) | pire cas : absente |
| Insérer au milieu | O(n) | il faut décaler les éléments suivants |
| Supprimer au milieu | O(n) | il faut combler le trou |
| Ajouter à la fin (s'il reste de la place) | O(1) | on écrit dans la prochaine case libre |

Voici l'insertion à une position donnée, avec le décalage qui explique le coût :

```c
/* Insère x à la position pos. Le tableau t contient n éléments
   et a de la place pour au moins n + 1. */
void inserer(int t[], int n, int pos, int x) {
    for (int i = n; i > pos; i--) {
        t[i] = t[i - 1];     /* décale vers la droite */
    }
    t[pos] = x;
}
```

Insérer en première position oblige à décaler les n éléments : c'est le pire cas.

## Taille fixe et débordement

En C, la taille d'un tableau est fixée à sa création. Écrire dans `t[n]` ou au-delà est un **débordement** (« buffer overflow ») : le programme écrit dans une zone mémoire qui ne lui appartient pas. Le comportement est indéfini et c'est une source classique de failles de sécurité. Vérifiez toujours que `0 <= i < n`.

Pour une taille variable, on alloue dynamiquement et on agrandit quand c'est nécessaire :

```c
int capacite = 4, n = 0;
int *t = malloc(capacite * sizeof *t);

void ajouter(int x) {
    if (n == capacite) {
        capacite *= 2;                       /* on double */
        t = realloc(t, capacite * sizeof *t);
    }
    t[n++] = x;
}
```

Doubler la capacité à chaque fois rend l'ajout en moyenne O(1) (on parle de coût **amorti**), même si un ajout isolé peut coûter O(n) lors de la recopie. En vrai code, vérifiez aussi que `malloc` et `realloc` ne renvoient pas `NULL`.

## À retenir : tableaux

- Éléments contigus, même type, indices à partir de 0.
- Accès par indice en O(1) ; insertion et suppression au milieu en O(n).
- Ne jamais sortir des bornes `0..n-1`.
- Un tableau dynamique double sa capacité pour garder un ajout amorti en O(1).

```quiz
Quelle opération est la plus coûteuse sur un grand tableau ?
- [ ] Lire `t[0]`
- [ ] Écrire `t[n-1]`
- [x] Insérer un élément en première position
- [ ] Lire `t[500]`
> Insérer au début oblige à décaler les n éléments : O(n). Les accès par indice sont en O(1).
```

```quiz
Pourquoi l'accès `t[i]` est-il en O(1) ?
- [x] Les éléments sont contigus et de même taille, l'adresse se calcule directement
- [ ] Le tableau est toujours trié
- [ ] L'ordinateur mémorise toutes les valeurs dans un cache
> adresse = début + i × taille de l'élément : un seul calcul, quel que soit i.
```
