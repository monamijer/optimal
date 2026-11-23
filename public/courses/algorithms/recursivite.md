# La récursivité

> Objectifs : écrire une fonction récursive correcte, comprendre la pile d'appels et reconnaître le coût d'une récursion mal conçue.

## Une fonction qui s'appelle elle-même

Une fonction est **récursive** quand elle s'appelle elle-même, sur un problème plus petit. Toute fonction récursive correcte a :

1. un **cas de base** : une situation si simple qu'on répond directement, sans nouvel appel ;
2. un **appel récursif** sur une donnée qui se rapproche du cas de base.

Sans cas de base, ou si l'on ne s'en rapproche jamais, la fonction ne s'arrête pas.

## Exemple : la factorielle

n! = n × (n − 1) × … × 1, avec 0! = 1. La définition est elle-même récursive : n! = n × (n − 1)!.

```c
unsigned long factorielle(unsigned int n) {
    if (n == 0) return 1;                  /* cas de base */
    return n * factorielle(n - 1);         /* appel sur un problème plus petit */
}
```

Pour `factorielle(3)`, les appels se déroulent ainsi : 3 × factorielle(2), qui attend 2 × factorielle(1), qui attend 1 × factorielle(0), qui renvoie 1. Les résultats remontent ensuite : 1, puis 1, puis 2, puis 6.

## La pile d'appels

Chaque appel de fonction réserve un espace en mémoire (variables locales, adresse de retour) sur la **pile d'appels**, une vraie pile au sens du chapitre précédent. Pour `factorielle(3)`, quatre appels sont en attente en même temps.

Une récursion trop profonde (ou sans fin) remplit la pile et provoque un **dépassement de pile** (*stack overflow*), qui interrompt le programme. La profondeur de la récursion compte donc dans la complexité spatiale : `factorielle(n)` utilise O(n) de pile.

## Quand la récursion coûte trop cher

La suite de Fibonacci (0, 1, 1, 2, 3, 5, 8, …) se définit par F(n) = F(n − 1) + F(n − 2) :

```c
unsigned long fib(unsigned int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);        /* deux appels : attention */
}
```

Cette version recalcule les mêmes valeurs un nombre énorme de fois : `fib(n)` appelle `fib(n-1)` et `fib(n-2)`, qui appellent chacun leurs deux voisins, etc. Le nombre d'appels croît exponentiellement (environ O(1,6ⁿ)) : `fib(50)` demande des dizaines de milliards d'appels. Une version itérative fait le même calcul en O(n) :

```c
unsigned long fib_iteratif(unsigned int n) {
    unsigned long a = 0, b = 1;
    for (unsigned int i = 0; i < n; i++) {
        unsigned long suivant = a + b;
        a = b;
        b = suivant;
    }
    return a;
}
```

On peut aussi garder la version récursive en **mémorisant** les résultats déjà calculés (la mémoïsation) : chaque valeur n'est alors calculée qu'une fois.

## Récursion ou boucle ?

Toute fonction récursive peut s'écrire avec une boucle, et inversement. On choisit la récursion quand elle exprime le problème plus clairement : parcours d'arbres, tri fusion (chapitre précédent), recherche dichotomique écrite récursivement. On choisit la boucle quand la profondeur peut être grande ou quand la récursion recalcule les mêmes choses.

## À retenir : récursivité

- Cas de base + appel sur un problème plus petit.
- Chaque appel en attente occupe de la pile : trop de profondeur = dépassement de pile.
- Attention aux récursions qui se dédoublent (Fibonacci naïf) : le coût devient exponentiel.

```quiz
Que se passe-t-il si une fonction récursive n'a pas de cas de base ?
- [ ] Elle renvoie 0
- [x] Les appels s'empilent jusqu'au dépassement de pile
- [ ] Le compilateur refuse de la compiler
> Sans cas de base, la récursion ne s'arrête jamais et la pile d'appels se remplit.
```

```quiz
Pourquoi la version naïve récursive de Fibonacci est-elle très lente ?
- [ ] Parce que la récursion est toujours plus lente qu'une boucle
- [x] Parce qu'elle recalcule les mêmes valeurs un très grand nombre de fois
- [ ] Parce qu'elle utilise des nombres trop grands
> Le nombre d'appels croît exponentiellement ; une boucle ou la mémoïsation donne O(n).
```
