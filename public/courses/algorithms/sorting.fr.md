# Les algorithmes de tri

> Objectifs : comprendre deux tris simples en O(n²) et le tri fusion en O(n log n), et savoir quand utiliser chacun.

## Pourquoi trier

Un tableau trié peut être lu dans l'ordre, parcouru par recherche dichotomique, et les doublons y sont faciles à repérer. Le tri est l'un des problèmes les plus étudiés en informatique.

## Le tri par insertion

On construit un préfixe trié un élément à la fois : chaque nouvel élément est inséré à sa place parmi les précédents, comme lorsque vous triez des cartes dans votre main.

```c
void insertion_sort(int values[], int count) {
    for (int i = 1; i < count; i++) {
        int current = values[i];
        int j = i - 1;
        while (j >= 0 && values[j] > current) {
            values[j + 1] = values[j];     /* décalage vers la droite */
            j--;
        }
        values[j + 1] = current;
    }
}
```

Pire cas (tableau en ordre inverse) : O(n²). Meilleur cas (déjà trié) : O(n). Un bon choix pour les **petits** tableaux ou ceux qui sont presque triés.

## Le tri par sélection

À chaque tour, on cherche le plus petit élément du reste du tableau et on le place en tête.

```c
void selection_sort(int values[], int count) {
    for (int i = 0; i < count - 1; i++) {
        int smallest = i;
        for (int j = i + 1; j < count; j++) {
            if (values[j] < values[smallest]) smallest = j;
        }
        int tmp = values[i];
        values[i] = values[smallest];
        values[smallest] = tmp;
    }
}
```

Toujours O(n²) comparaisons, même sur un tableau déjà trié. En revanche, il effectue très peu d'échanges (au plus n − 1).

## Le tri fusion

Il utilise la stratégie **diviser pour régner** : on coupe le tableau en deux moitiés, on trie chacune récursivement, puis on **fusionne** les deux moitiés triées en une seule.

```c
static void merge(int values[], int buffer[], int start, int mid, int end) {
    int i = start, j = mid, k = start;
    while (i < mid && j < end) {
        buffer[k++] = (values[i] <= values[j]) ? values[i++] : values[j++];
    }
    while (i < mid) buffer[k++] = values[i++];
    while (j < end) buffer[k++] = values[j++];
    for (k = start; k < end; k++) values[k] = buffer[k];
}

static void sort_range(int values[], int buffer[], int start, int end) {
    if (end - start < 2) return;               /* 0 ou 1 élément : déjà trié */
    int mid = start + (end - start) / 2;
    sort_range(values, buffer, start, mid);
    sort_range(values, buffer, mid, end);
    merge(values, buffer, start, mid, end);
}

void merge_sort(int values[], int count) {
    int *buffer = malloc(count * sizeof *buffer);
    if (buffer == NULL) return;
    sort_range(values, buffer, 0, count);
    free(buffer);
}
```

On coupe en deux log₂(n) fois, et chaque niveau de fusion parcourt n éléments : le coût total est de **O(n log n)** dans tous les cas. Le prix à payer est un tableau auxiliaire : O(n) de mémoire supplémentaire.

## Comparaison des tris

| Tri | Pire cas | Meilleur cas | Mémoire supplémentaire | Remarque |
|---|---|---|---|---|
| Insertion | O(n²) | O(n) | O(1) | excellent s'il est presque trié |
| Sélection | O(n²) | O(n²) | O(1) | peu d'échanges |
| Fusion | O(n log n) | O(n log n) | O(n) | régulier, stable |

Pour un million d'éléments, n² représente mille milliards d'opérations, alors que n log n n'en fait qu'une vingtaine de millions : la différence est énorme. Les bibliothèques standard utilisent des tris en O(n log n) (par exemple `qsort` en C, `sort` en Python ou en JavaScript). En pratique, vous écrivez rarement votre propre tri, mais vous devez savoir ce qu'ils coûtent.

Un tri est **stable** s'il conserve l'ordre relatif des éléments égaux. Le tri fusion ci-dessus l'est (grâce au `<=`), tout comme le tri par insertion ; le tri par sélection ne l'est pas.

## Points clés : le tri

- Insertion et sélection : O(n²), simples, adaptés aux petits tableaux.
- Fusion : O(n log n) dans tous les cas, avec de la mémoire supplémentaire.
- « Diviser pour régner » : découper, résoudre chaque morceau, combiner.

```quiz
Quel tri est le plus rapide sur un tableau déjà presque trié ?
- [x] Le tri par insertion
- [ ] Le tri par sélection
- [ ] Ils sont tous identiques
> Le tri par insertion ne décale presque rien et approche O(n) ; le tri par sélection fait toujours O(n²) comparaisons.
```

```quiz
Quelles sont les caractéristiques du tri fusion ? (plusieurs réponses)
- [x] Une complexité de O(n log n) dans tous les cas
- [x] Il utilise un tableau auxiliaire
- [ ] Il trie sur place sans mémoire supplémentaire
- [ ] Il est en O(n²) dans le pire cas
> Diviser puis fusionner donne O(n log n), au prix de O(n) de mémoire supplémentaire.
```
