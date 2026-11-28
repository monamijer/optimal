# Penser récursivement

> Objectifs : écrire une fonction récursive correcte, comprendre la pile d'appels et repérer le coût d'une récursivité mal conçue.

## Une fonction qui s'appelle elle-même

Une fonction est **récursive** quand elle s'appelle elle-même sur un problème plus petit. Toute fonction récursive correcte comporte :

1. un **cas de base** : une situation si simple qu'on répond directement, sans nouvel appel ;
2. un **appel récursif** sur des données qui se rapprochent du cas de base.

Sans cas de base, ou si l'on ne s'en rapproche jamais, la fonction ne s'arrête pas.

## Exemple : la factorielle

n! = n × (n − 1) × … × 1, avec 0! = 1. La définition est elle-même récursive : n! = n × (n − 1)!.

```c
unsigned long factorial(unsigned int n) {
    if (n == 0) return 1;                  /* cas de base */
    return n * factorial(n - 1);           /* appel sur un problème plus petit */
}
```

Pour `factorial(3)`, les appels se déroulent ainsi : 3 × factorial(2), qui attend 2 × factorial(1), qui attend 1 × factorial(0), qui renvoie 1. Les résultats remontent ensuite : 1, puis 1, puis 2, puis 6.

## La pile d'appels

Chaque appel de fonction réserve de la place en mémoire (variables locales, adresse de retour) sur la **pile d'appels**, une véritable pile au sens du chapitre précédent. Pour `factorial(3)`, quatre appels sont en attente en même temps.

Une récursivité trop profonde (ou sans fin) remplit la pile et provoque un **dépassement de pile**, qui arrête le programme. La profondeur de la récursivité compte donc dans la complexité en espace : `factorial(n)` utilise O(n) de pile.

## Quand la récursivité coûte trop cher

La suite de Fibonacci (0, 1, 1, 2, 3, 5, 8, …) est définie par F(n) = F(n − 1) + F(n − 2) :

```c
unsigned long fib(unsigned int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);        /* deux appels : attention */
}
```

Cette version recalcule les mêmes valeurs un nombre énorme de fois : `fib(n)` appelle `fib(n-1)` et `fib(n-2)`, qui appellent chacun leurs deux voisins, et ainsi de suite. Le nombre d'appels croît de façon exponentielle (environ O(1.6ⁿ)) : `fib(50)` demande des dizaines de milliards d'appels. Une version itérative effectue le même calcul en O(n) :

```c
unsigned long fib_iterative(unsigned int n) {
    unsigned long previous = 0, current = 1;
    for (unsigned int i = 0; i < n; i++) {
        unsigned long next = previous + current;
        previous = current;
        current = next;
    }
    return previous;
}
```

Vous pouvez aussi garder la version récursive et **mémoïser** les résultats déjà calculés : chaque valeur n'est alors calculée qu'une seule fois.

## Récursivité ou boucle ?

Toute fonction récursive peut s'écrire avec une boucle, et inversement. Choisissez la récursivité quand elle exprime le problème plus clairement : parcours d'arbre, tri fusion (chapitre précédent), recherche dichotomique écrite récursivement. Choisissez une boucle quand la profondeur risque d'être grande ou quand la récursivité recalcule les mêmes choses.

## Pratique : suivre les appels

Faites ces calculs, saisissez la réponse et appuyez sur **Vérifier**.

```exercise
Que renvoie `factorial(5)`, avec la fonction ci-dessus ?
--- answer
120
--- explain
5 × 4 × 3 × 2 × 1 = 120.
--- hint
Déroulez les appels comme dans l'exemple de factorial(3).
```

```exercise
Combien d'appels à `factorial` ont lieu au total pour `factorial(5)`, en comptant le premier appel et celui qui atteint le cas de base ?
--- answer
6
--- explain
Les appels concernent 5, 4, 3, 2, 1 et 0 : six appels.
--- hint
La récursion s'arrête à n == 0.
```

## Points clés : la récursivité

- Cas de base + un appel sur un problème plus petit.
- Chaque appel en attente occupe de la place sur la pile : trop de profondeur provoque un dépassement de pile.
- Méfiez-vous des récursivités qui se divisent en deux (Fibonacci naïf) : le coût devient exponentiel.

```quiz
Que se passe-t-il si une fonction récursive n'a pas de cas de base ?
- [ ] Elle renvoie 0
- [x] Les appels s'empilent jusqu'au dépassement de la pile
- [ ] Le compilateur refuse de la compiler
> Sans cas de base, la récursivité ne s'arrête jamais et la pile d'appels se remplit.
```

```quiz
Pourquoi le Fibonacci récursif naïf est-il très lent ?
- [ ] Parce que la récursivité est toujours plus lente qu'une boucle
- [x] Parce qu'il recalcule les mêmes valeurs un très grand nombre de fois
- [ ] Parce qu'il utilise des nombres trop grands
> Le nombre d'appels croît de façon exponentielle ; une boucle ou la mémoïsation donne O(n).
```
