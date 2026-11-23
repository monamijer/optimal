# Les tris

> Objectifs : comprendre deux tris simples en O(n²) et le tri fusion en O(n log n), et savoir quand utiliser lequel.

## Pourquoi trier

Un tableau trié se parcourt dans l'ordre, se recherche par dichotomie et permet de repérer immédiatement les doublons. Trier est l'un des problèmes les plus étudiés de l'informatique.

## Tri par insertion

On construit un début de tableau trié, élément par élément : chaque nouvel élément est inséré à sa place parmi ceux qui précèdent, comme on range des cartes dans sa main.

```c
void tri_insertion(int t[], int n) {
    for (int i = 1; i < n; i++) {
        int x = t[i];
        int j = i - 1;
        while (j >= 0 && t[j] > x) {
            t[j + 1] = t[j];      /* décale vers la droite */
            j--;
        }
        t[j + 1] = x;
    }
}
```

Pire cas (tableau trié à l'envers) : O(n²). Meilleur cas (déjà trié) : O(n). C'est un bon choix pour de **petits** tableaux ou des tableaux presque triés.

## Tri par sélection

À chaque tour, on cherche le plus petit élément du reste du tableau et on le place en tête.

```c
void tri_selection(int t[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++) {
            if (t[j] < t[min]) min = j;
        }
        int tmp = t[i]; t[i] = t[min]; t[min] = tmp;
    }
}
```

Toujours O(n²) comparaisons, même sur un tableau déjà trié. Il fait en revanche très peu d'échanges (au plus n − 1).

## Tri fusion

On applique la stratégie **diviser pour régner** : on coupe le tableau en deux moitiés, on trie chacune récursivement, puis on **fusionne** les deux moitiés triées en une seule.

```c
static void fusionner(int t[], int tmp[], int debut, int milieu, int fin) {
    int i = debut, j = milieu, k = debut;
    while (i < milieu && j < fin) {
        tmp[k++] = (t[i] <= t[j]) ? t[i++] : t[j++];
    }
    while (i < milieu) tmp[k++] = t[i++];
    while (j < fin)    tmp[k++] = t[j++];
    for (k = debut; k < fin; k++) t[k] = tmp[k];
}

static void trier(int t[], int tmp[], int debut, int fin) {
    if (fin - debut < 2) return;               /* 0 ou 1 élément : déjà trié */
    int milieu = debut + (fin - debut) / 2;
    trier(t, tmp, debut, milieu);
    trier(t, tmp, milieu, fin);
    fusionner(t, tmp, debut, milieu, fin);
}

void tri_fusion(int t[], int n) {
    int *tmp = malloc(n * sizeof *tmp);
    if (tmp == NULL) return;
    trier(t, tmp, 0, n);
    free(tmp);
}
```

On coupe en deux log₂(n) fois, et chaque niveau de fusion parcourt n éléments : le coût total est **O(n log n)**, dans tous les cas. Le prix à payer est un tableau auxiliaire : O(n) de mémoire en plus.

## Comparaison

| Tri | Pire cas | Meilleur cas | Mémoire en plus | Remarque |
|---|---|---|---|---|
| Insertion | O(n²) | O(n) | O(1) | excellent si presque trié |
| Sélection | O(n²) | O(n²) | O(1) | peu d'échanges |
| Fusion | O(n log n) | O(n log n) | O(n) | régulier, stable |

Pour un million d'éléments, n² vaut mille milliards d'opérations alors que n log n n'en vaut qu'une vingtaine de millions : la différence est énorme. Les bibliothèques standard utilisent des tris en O(n log n) (par exemple `qsort` en C, `sort` en Python ou en JavaScript) : on écrit rarement son propre tri en pratique, mais il faut savoir ce qu'ils coûtent.

Un tri est dit **stable** s'il conserve l'ordre relatif des éléments égaux. Le tri fusion écrit ci-dessus l'est (grâce au `<=`), ainsi que le tri par insertion ; le tri par sélection ne l'est pas.

## À retenir : tris

- Insertion et sélection : O(n²), simples, adaptés aux petits tableaux.
- Fusion : O(n log n) dans tous les cas, avec de la mémoire supplémentaire.
- « Diviser pour régner » : découper, résoudre chaque morceau, recombiner.

```quiz
Quel tri est le plus rapide sur un tableau qui est déjà presque trié ?
- [x] Le tri par insertion
- [ ] Le tri par sélection
- [ ] Ils sont tous identiques
> L'insertion ne décale presque rien et approche O(n) ; la sélection fait toujours O(n²) comparaisons.
```

```quiz
Quelles sont les caractéristiques du tri fusion ? (plusieurs réponses)
- [x] Complexité O(n log n) dans tous les cas
- [x] Il utilise un tableau auxiliaire
- [ ] Il trie sur place sans mémoire supplémentaire
- [ ] Il est en O(n²) dans le pire cas
> Diviser et fusionner donne O(n log n), au prix de O(n) de mémoire en plus.
```
