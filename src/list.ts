import { None, Option, Some } from "./option.ts";
import { Defined } from "./types.ts";
import { isDefined, isFunction } from "./util.ts";

export class List<T extends Defined> implements Iterable<T> {
  #array: ReadonlyArray<T>;

  private constructor(iterable: Iterable<T>) {
    this.#array = Array.from(iterable);
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.#array;
  }

  /**
   * Creates an empty List.
   *
   * @template T - The type of elements in the List.
   * @returns {List<T>} A new List instance with no elements.
   *
   * @example
   * // Creating an empty list of numbers
   * const emptyNumberList = List.empty<number>();
   *
   * // Creating an empty list of strings
   * const emptyStringList = List.empty<string>();
   */
  static empty<T extends Defined>(): List<T> {
    return new List([]);
  }

  /**
   * Creates a new List from the provided elements.
   *
   * @template T - The type of elements in the List.
   * @param {...T[]} items - The elements to include in the new List.
   * @returns {List<T>} A new List instance containing the provided elements.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Creating a list of strings
   * const stringList = List.of("apple", "banana", "orange");
   */
  static of<T extends Defined>(...items: readonly T[]): List<T> {
    return new List(items);
  }

  /**
   * Creates a new List from an iterable or array-like object.
   *
   * @template T - The type of elements in the List.
   * @param {Iterable<T> | ArrayLike<T>} iterable - The iterable or array-like object to convert into a List.
   * @returns {List<T>} A new List instance containing the elements from the iterable or array-like object.
   *
   * @example
   * // Creating a list from an array
   * const array = [1, 2, 3, 4, 5];
   * const listFromArray = List.from(array);
   *
   * // Creating a list from a Set
   * const set = new Set(["apple", "banana", "orange"]);
   * const listFromSet = List.from(set);
   *
   * // Creating a list from a string
   * const string = "hello";
   * const listFromString = List.from(string);
   */
  static from<T extends Defined>(
    iterable: Iterable<T> | ArrayLike<T>,
  ): List<T> {
    return new List(Array.from(iterable));
  }

  /**
   * Creates a deep copy of the List.
   *
   * @returns {List<T>} A new List instance with a deep copy of the elements from the original List.
   *
   * @example
   * // Creating a list of objects
   * const originalList = List.of({ id: 1, name: "Alice" }, { id: 2, name: "Bob" });
   *
   * // Cloning the list
   * const clonedList = originalList.clone();
   *
   * // Modifying the cloned list does not affect the original list
   * const originalUser = originalList.first().unwrap();
   * clonedList.first().unwrap().name = "Charlie";
   * const clonedUser = clonedList.first().unwrap();
   *
   * console.log(originalUser); // { id: 1, name: "Alice" }
   * console.log(clonedUser);   // { id: 1, name: "Charlie" }
   */
  clone(): List<T> {
    return new List(structuredClone(this.#array));
  }

  /**
   * Appends elements to the end of the List.
   *
   * @param {...T[]} items - The elements to append to the List.
   * @returns {List<T>} A new List instance with the additional elements.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3);
   *
   * // Appending more numbers to the list
   * const appendedList = originalList.append(4, 5, 6);
   *
   * console.log(originalList.toArray());  // [1, 2, 3]
   * console.log(appendedList.toArray());  // [1, 2, 3, 4, 5, 6]
   */
  append(...items: readonly T[]): List<T> {
    return new List([...this.#array, ...items]);
  }

  /**
   * Prepends elements to the beginning of the List.
   *
   * @param {...T[]} items - The elements to prepend to the List.
   * @returns {List<T>} A new List instance with the additional elements at the beginning.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(3, 4, 5);
   *
   * // Prepending numbers to the list
   * const prependedList = originalList.prepend(1, 2);
   *
   * console.log(originalList.toArray());  // [3, 4, 5]
   * console.log(prependedList.toArray());  // [1, 2, 3, 4, 5]
   */
  prepend(...items: readonly T[]): List<T> {
    return new List([...items, ...this.#array]);
  }

  /**
   * Inserts an element at the specified index in the List.
   *
   * @param {T} item - The element to insert into the List.
   * @param {number} at - The index at which to insert the element. Negative values count from the end of the List.
   * @returns {List<T>} A new List instance with the element inserted at the specified index.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 4, 5);
   *
   * // Inserting the number 3 at index 2
   * const insertedList = originalList.insert(3, 2);
   *
   * console.log(originalList.toArray());  // [1, 2, 4, 5]
   * console.log(insertedList.toArray());  // [1, 2, 3, 4, 5]
   */
  insert(item: T, at: number): List<T> {
    at = at < 0 ? this.#array.length + at : at;
    return new List(this.#array.toSpliced(at, 0, item));
  }

  /**
   * Removes an element at the specified index from the List.
   *
   * @param {number} index - The index of the element to remove. Negative values count from the end of the List.
   * @returns {List<T>} A new List instance with the element removed at the specified index.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5);
   *
   * // Removing the number at index 2
   * const removedList = originalList.remove(2);
   *
   * console.log(originalList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(removedList.toArray());  // [1, 2, 4, 5]
   */
  remove(index: number): List<T> {
    index = index < 0 ? this.#array.length + index : index;
    return new List(this.#array.toSpliced(index, 1));
  }

  /**
   * Retrieves the element at the specified index in the List, wrapped in an Option.
   *
   * @param {number} index - The index of the element to retrieve. Negative values count from the end of the List.
   * @returns {Option<T>} An Option containing the element at the specified index, or None if the index is out of bounds.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5);
   *
   * // Retrieving the element at index 2
   * const elementAtIndex = originalList.at(2);
   *
   * console.log(elementAtIndex.isSome()); // true
   * console.log(elementAtIndex.unwrap()); // 3
   */
  at(index: number): Option<T> {
    return Option.from(this.#array.at(index));
  }

  /**
   * Retrieves the first element of the List, wrapped in an Option.
   *
   * @returns {Option<T>} An Option containing the first element of the List, or None if the List is empty.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5);
   *
   * // Retrieving the first element
   * const firstElement = originalList.first();
   *
   * console.log(firstElement.isSome()); // true
   * console.log(firstElement.unwrap()); // 1
   */
  first(): Option<T> {
    return this.at(0);
  }

  /**
   * Retrieves the last element of the List, wrapped in an Option.
   *
   * @returns {Option<T>} An Option containing the last element of the List, or None if the List is empty.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5);
   *
   * // Retrieving the last element
   * const lastElement = originalList.last();
   *
   * console.log(lastElement.isSome()); // true
   * console.log(lastElement.unwrap()); // 5
   */
  last(): Option<T> {
    return this.at(-1);
  }

  /**
   * Finds the first element in the List that satisfies the provided predicate, wrapped in an Option.
   *
   * @param {(item: T) => boolean} predicate - A function that tests each element of the List.
   * @returns {Option<T>} An Option containing the first element that satisfies the predicate, or None if no such element is found.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Finding the first even number
   * const firstEven = numberList.find((num) => num % 2 === 0);
   *
   * console.log(firstEven.isSome()); // true
   * console.log(firstEven.unwrap()); // 2
   */
  find(predicate: (item: T) => boolean): Option<T> {
    return Option.from(this.#array.find(predicate));
  }

  /**
   * Returns an Option containing the index of the first element in the List that satisfies the provided testing function.
   *
   * @param {(item: T) => boolean} predicate - The function that tests each element of the List.
   * @returns {Option<number>} An Option containing the index of the first matching element, or None if no matching element is found.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5, 6);
   *
   * // Finding the index of the first even number
   * const indexOption = originalList.findIndex((num) => num % 2 === 0);
   *
   * console.log(originalList.toArray());  // [1, 2, 3, 4, 5, 6]
   * console.log(indexOption);  // Some(1) (the index of the first even number, which is 1)
   */
  findIndex(predicate: (item: T) => boolean): Option<number> {
    const foundIndex = this.#array.findIndex(predicate);
    return foundIndex === -1 ? None : Some(foundIndex);
  }

  /**
   * Returns an Option containing the index of the last element in the List that satisfies the provided testing function.
   *
   * @param {(item: T) => boolean} predicate - The function that tests each element of the List.
   * @returns {Option<number>} An Option containing the index of the last matching element, or None if no matching element is found.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5, 6);
   *
   * // Finding the index of the last even number
   * const indexOption = originalList.findLastIndex((num) => num % 2 === 0);
   *
   * console.log(originalList.toArray());  // [1, 2, 3, 4, 5, 6]
   * console.log(indexOption);  // Some(3) (the index of the last even number, which is 3)
   */
  findLastIndex(predicate: (item: T) => boolean): Option<number> {
    const foundIndex = this.#array.findLastIndex(predicate);
    return foundIndex === -1 ? None : Some(foundIndex);
  }

  /**
   * Finds the last element in the List that satisfies the provided predicate, wrapped in an Option.
   *
   * @param {(item: T) => boolean} predicate - A function that tests each element of the List.
   * @returns {Option<T>} An Option containing the last element that satisfies the predicate, or None if no such element is found.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Finding the last even number
   * const lastEven = numberList.findLast((num) => num % 2 === 0);
   *
   * console.log(lastEven.isSome()); // true
   * console.log(lastEven.unwrap()); // 4
   */
  findLast(predicate: (item: T) => boolean): Option<T> {
    const item = this.#array.findLast(predicate);
    return isDefined(item) ? Some(item) : None;
  }

  /**
   * Swaps the positions of two elements in the List.
   *
   * @param {number} from - The index of the element to swap.
   * @param {number} to - The index to swap the element with.
   * @returns {List<T>} A new List instance with the elements at the specified indices swapped.
   *
   * @example
   * // Creating a list of letters
   * const letterList = List.of('A', 'B', 'C', 'D', 'E');
   *
   * // Swapping the positions of 'B' and 'D'
   * const swappedList = letterList.swap(1, 3);
   *
   * console.log(letterList.toArray());  // ['A', 'B', 'C', 'D', 'E']
   * console.log(swappedList.toArray());  // ['A', 'D', 'C', 'B', 'E']
   */
  swap(from: number, to: number): List<T> {
    from = from < 0 ? this.#array.length + from : from;
    to = to < 0 ? this.#array.length + to : to;
    if (from < 0 || from >= this.#array.length) return this;
    if (to < 0 || to >= this.#array.length) return this;
    const temp = this.#array[to];
    const arr = this.#array.slice();
    arr[to] = arr[from];
    arr[from] = temp;
    return new List(arr);
  }

  /**
   * Replaces an element at the specified index in the List.
   *
   * @param {T} item - The element to replace the existing element with.
   * @param {number} at - The index at which to replace the element. Negative values count from the end of the List.
   * @returns {List<T>} A new List instance with the element replaced at the specified index.
   *
   * @example
   * // Creating a list of fruits
   * const fruitList = List.of('Apple', 'Banana', 'Orange');
   *
   * // Replacing 'Banana' with 'Grapes' at index 1
   * const replacedList = fruitList.replace('Grapes', 1);
   *
   * console.log(fruitList.toArray());  // ['Apple', 'Banana', 'Orange']
   * console.log(replacedList.toArray());  // ['Apple', 'Grapes', 'Orange']
   */
  replace(item: T, at: number): List<T> {
    at = at < 0 ? this.#array.length + at : at;
    return new List(this.#array.with(at, item));
  }

  /**
   * Returns a new List with the element at the specified index updated based on the provided function.
   *
   * @param {number} at - The index of the element to update.
   * @param {(prev: T) => T} fn - The function that takes the current element and returns the updated element.
   * @returns {List<T>} A new List with the updated element at the specified index, or the original List if the index is out of bounds.
   *
   * @example
   * // Creating a list of objects
   * const originalList = List.of(
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' },
   *   { id: 3, name: 'Charlie' }
   * );
   *
   * // Updating the element at index 1 by changing the name
   * const updatedList = originalList.update(1, (prev) => ({ ...prev, name: 'Updated Bob' }));
   *
   * console.log(originalList.toArray());
   * // [
   * //   { id: 1, name: 'Alice' },
   * //   { id: 2, name: 'Bob' },
   * //   { id: 3, name: 'Charlie' }
   * // ]
   *
   * console.log(updatedList.toArray());
   * // [
   * //   { id: 1, name: 'Alice' },
   * //   { id: 2, name: 'Updated Bob' },
   * //   { id: 3, name: 'Charlie' }
   * // ]
   */
  update(at: number, fn: (prev: T) => T): List<T> {
    return this.at(at).match(
      (value) => new List(this.#array.with(at, fn(value))),
      () => this,
    );
  }

  /**
   * Shuffles the elements of the List randomly.
   *
   * @returns {List<T>} A new List instance with the elements shuffled randomly.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Shuffling the order of numbers
   * const shuffledList = numberList.shuffle();
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(shuffledList.toArray());  // [3, 5, 2, 1, 4] (example output)
   */
  shuffle(): List<T> {
    const shuffledArray = this.#array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return new List(shuffledArray);
  }

  /**
   * Returns an Option containing a randomly selected element from the List.
   *
   * @returns {Option<T>} An Option containing the randomly selected element, or None if the List is empty.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Selecting a random number from the list
   * const randomOption = numberList.random();
   *
   * if (isSome(randomOption)) {
   *   console.log('Random number:', randomOption.value);
   * } else {
   *   console.log('The list is empty.');
   * }
   */
  random(): Option<T> {
    const randomIndex = Math.floor(Math.random() * this.#array.length);
    return this.at(randomIndex);
  }

  /**
   * Sorts the elements of the List based on the provided comparator function or the default sorting order.
   *
   * @param {(a: T, b: T) => number} [fn] - A comparator function that defines the sort order. If not provided, the default sorting order is used.
   * @returns {List<T>} A new List instance with the elements sorted.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(5, 3, 1, 4, 2);
   *
   * // Sorting the numbers in ascending order
   * const sortedList = numberList.sort((a, b) => a - b);
   *
   * console.log(numberList.toArray());  // [5, 3, 1, 4, 2]
   * console.log(sortedList.toArray());  // [1, 2, 3, 4, 5]
   */
  sort(fn?: (a: T, b: T) => number): List<T> {
    return new List(this.#array.toSorted(fn));
  }

  /**
   * Reverses the order of the elements in the List.
   *
   * @returns {List<T>} A new List instance with the elements in reverse order.
   *
   * @example
   * // Creating a list of letters
   * const letterList = List.of('A', 'B', 'C', 'D', 'E');
   *
   * // Reversing the order of letters
   * const reversedList = letterList.reverse();
   *
   * console.log(letterList.toArray());  // ['A', 'B', 'C', 'D', 'E']
   * console.log(reversedList.toArray());  // ['E', 'D', 'C', 'B', 'A']
   */
  reverse(): List<T> {
    return new List(this.#array.toReversed());
  }

  /**
   * Removes duplicate elements from the List based on a discriminator function or the default equality check.
   *
   * @param {((item: T) => K)} [discriminator] - A function that generates a unique key for each element. If not provided, the default equality check is used.
   * @returns {List<T>} A new List instance with duplicate elements removed.
   *
   * @example
   * // Creating a list of numbers with duplicates
   * const numberList = List.of(1, 2, 3, 2, 4, 5, 1);
   *
   * // Removing duplicate numbers
   * const uniqueList = numberList.uniq();
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 2, 4, 5, 1]
   * console.log(uniqueList.toArray());  // [1, 2, 3, 4, 5] (example output)
   *
   * // Creating a list of objects with a discriminator function
   * const personList = List.of(
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' },
   *   { id: 1, name: 'Charlie' }
   * );
   *
   * // Removing persons with duplicate IDs
   * const uniquePersons = personList.uniq((person) => person.id);
   *
   * console.log(personList.toArray());
   * // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 1, name: 'Charlie' }]
   * console.log(uniquePersons.toArray());
   * // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
   */
  uniq<K extends (string | number)>(discriminator?: (item: T) => K): List<T> {
    if (!isFunction(discriminator)) {
      return new List(new Set(this.#array));
    }
    const map = new Map<K, T>();
    for (const item of this.#array) {
      const key = discriminator(item);
      if (map.has(key)) continue;
      map.set(key, item);
    }
    return new List(map.values());
  }

  /**
   * Creates a new List with the specified number of elements taken from the beginning of the original List.
   *
   * @param {number} count - The number of elements to take from the beginning of the List.
   * @returns {List<T>} A new List instance with the specified number of elements taken from the beginning.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Taking the first three numbers
   * const takenList = numberList.take(3);
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(takenList.toArray());  // [1, 2, 3]
   */
  take(count: number): List<T> {
    return new List(this.#array.slice(0, count));
  }

  /**
   * Returns a new List containing elements from the start of the original List until the specified predicate becomes false.
   *
   * @param {(item: T, index: number) => boolean} predicate - The function that tests each element of the List along with its index.
   * @returns {List<T>} A new List containing elements from the original List until the predicate becomes false.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5, 6);
   *
   * // Taking elements from the start until a number greater than 3 is encountered
   * const takenList = originalList.takeWhile((num, index) => num <= 3);
   *
   * console.log(originalList.toArray());  // [1, 2, 3, 4, 5, 6]
   * console.log(takenList.toArray());  // [1, 2, 3]
   */
  takeWhile(predicate: (item: T, index: number) => boolean): List<T> {
    const takeIndex = this.#array.findIndex((item, index) =>
      !predicate(item, index)
    );
    return this.take(takeIndex === -1 ? this.#array.length : takeIndex);
  }

  /**
   * Creates a new List with the specified number of elements skipped from the beginning of the original List.
   *
   * @param {number} count - The number of elements to skip from the beginning of the List.
   * @returns {List<T>} A new List instance with the specified number of elements skipped from the beginning.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Skipping the first two numbers
   * const droppedList = numberList.drop(2);
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(droppedList.toArray());  // [3, 4, 5]
   */
  drop(count: number): List<T> {
    return new List(this.#array.slice(count));
  }

  /**
   * Returns a new List containing elements from the original List starting after the specified predicate becomes false.
   *
   * @param {(item: T) => boolean} predicate - The function that tests each element of the List.
   * @returns {List<T>} A new List containing elements from the original List starting after the predicate becomes false.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5, 6);
   *
   * // Dropping elements from the start until a number greater than 3 is encountered
   * const droppedList = originalList.dropWhile((num) => num <= 3);
   *
   * console.log(originalList.toArray());  // [1, 2, 3, 4, 5, 6]
   * console.log(droppedList.toArray());  // [4, 5, 6]
   */
  dropWhile(predicate: (item: T) => boolean): List<T> {
    let dropIndex = 0;
    for (const item of this.#array) {
      if (!predicate(item)) {
        break;
      }
      dropIndex += 1;
    }
    return this.drop(dropIndex);
  }

  /**
   * Creates a new List with elements that satisfy the provided predicate function.
   *
   * @template U - The type of elements in the new List after filtering.
   * @param {(item: T) => item is U} predicate - A predicate function that defines the filtering criteria.
   * @returns {List<U>} A new List instance with elements that satisfy the provided predicate.
   *
   * @example
   * // Creating a list of mixed values
   * const mixedList = List.of(1, 'two', 3, 'four', 5);
   *
   * // Filtering only numbers from the mixed list
   * const numberList = mixedList.filter((item): item is number => typeof item === 'number');
   *
   * console.log(mixedList.toArray());  // [1, 'two', 3, 'four', 5]
   * console.log(numberList.toArray());  // [1, 3, 5]
   */
  filter<U extends T>(predicate: (item: T) => item is U): List<U>;

  /**
   * Creates a new List with elements that satisfy the provided predicate function.
   *
   * @param {(item: T) => boolean} predicate - A predicate function that defines the filtering criteria.
   * @returns {List<T>} A new List instance with elements that satisfy the provided predicate.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Filtering only even numbers
   * const evenList = numberList.filter((item) => item % 2 === 0);
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(evenList.toArray());  // [2, 4]
   */
  filter(predicate: (item: T) => boolean): List<T>;
  filter(predicate: (item: T) => boolean): List<T> {
    return new List(this.#array.filter(predicate));
  }

  /**
   * Creates a new List by applying a function to each element of the original List.
   *
   * @template U - The type of elements in the new List after mapping.
   * @param {(item: T) => U} fn - A function that transforms each element of the List.
   * @returns {List<U>} A new List instance with elements transformed by the provided function.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Doubling each number in the list
   * const doubledList = numberList.map((item) => item * 2);
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(doubledList.toArray());  // [2, 4, 6, 8, 10]
   */
  map<U extends Defined>(fn: (item: T) => U): List<U> {
    return new List(this.#array.map(fn));
  }

  /**
   * Reduces the List to a single value by applying a reducer function to each element.
   *
   * @template U - The type of the accumulated result.
   * @param {U} initialValue - The initial value of the accumulator.
   * @param {(prev: U, next: T) => U} reducer - A function that combines the previous accumulator value and the current element.
   * @returns {U} The final accumulated result.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Summing all numbers in the list
   * const sum = numberList.reduce(0, (prev, next) => prev + next);
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(sum);  // 15
   */
  reduce<U>(initialValue: U, reducer: (prev: U, next: T) => U): U {
    return this.#array.reduce(reducer, initialValue);
  }

  /**
   * Reduces the List from right to left to a single value by applying a reducer function to each element.
   *
   * @template U - The type of the accumulated result.
   * @param {U} initialValue - The initial value of the accumulator.
   * @param {(prev: U, next: T) => U} reducer - A function that combines the previous accumulator value and the current element.
   * @returns {U} The final accumulated result.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Concatenating numbers from right to left
   * const concatenated = numberList.reduceRight('', (prev, next) => prev + next);
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(concatenated);  // '54321'
   */
  reduceRight<U>(initialValue: U, reducer: (prev: U, next: T) => U): U {
    return this.#array.reduceRight(reducer, initialValue);
  }

  /**
   * Groups the elements of the List based on a grouping function that generates keys.
   *
   * @template K - The type of keys generated by the grouping function.
   * @param {(item: T) => K} fn - A function that generates keys for grouping elements.
   * @returns {Record<K, T[]>} An object where keys are generated by the function, and values are arrays of grouped elements.
   *
   * @example
   * // Creating a list of persons with ages
   * const personList = List.of(
   *   { name: 'Alice', age: 25 },
   *   { name: 'Bob', age: 30 },
   *   { name: 'Charlie', age: 25 }
   * );
   *
   * // Grouping persons by age
   * const groupedByAge = personList.group((person) => person.age);
   *
   * console.log(personList.toArray());
   * // [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }, { name: 'Charlie', age: 25 }]
   * console.log(groupedByAge);
   * // { '25': [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 25 }], '30': [{ name: 'Bob', age: 30 }] }
   */
  group<K extends PropertyKey>(fn: (item: T) => K): Record<K, T[]> {
    const record = Object.create(null) as Record<K, T[]>;
    for (const item of this.#array) {
      const key = fn(item);
      record[key] ??= [];
      record[key].push(item);
    }
    return record;
  }

  /**
   * Returns a new List containing a portion of the original List.
   *
   * @param {number} [start] - The index at which to begin extraction. Default is 0.
   * @param {number} [end] - The index at which to end extraction. The List is copied up to, but not including, this index. Default is the length of the List.
   * @returns {List<T>} A new List containing elements from the original List based on the specified indices.
   *
   * @example
   * // Creating a list of numbers
   * const originalList = List.of(1, 2, 3, 4, 5);
   *
   * // Slicing the list from index 1 to 4 (exclusive)
   * const slicedList = originalList.slice(1, 4);
   *
   * console.log(originalList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(slicedList.toArray());  // [2, 3, 4]
   */
  slice(start?: number, end?: number): List<T> {
    return new List(this.#array.slice(start, end));
  }

  /**
   * Returns a new List by applying a function to each element of the original List and flattening the resulting arrays into a single List.
   *
   * @template U - The type of elements in the resulting List.
   * @param {(item: T) => U[]} fn - The function to apply to each element of the original List.
   * @returns {List<U>} A new List containing the flattened elements.
   *
   * @example
   * // Creating a list of words
   * const originalList = List.of('apple', 'banana', 'cherry');
   *
   * // Mapping each word to its individual characters and flattening the result
   * const flatMappedList = originalList.flatMap((word) => word.split(''));
   *
   * console.log(originalList.toArray());  // ['apple', 'banana', 'cherry']
   * console.log(flatMappedList.toArray());  // ['a', 'p', 'p', 'l', 'e', 'b', 'a', 'n', 'a', 'n', 'a', 'c', 'h', 'e', 'r', 'r', 'y']
   */
  flatMap<U extends Defined>(fn: (item: T) => U[]): List<U> {
    return new List(this.#array.flatMap(fn));
  }

  /**
   * Splits the List into two Lists based on a provided predicate.
   *
   * @param {(item: T) => boolean} predicate - A function that determines the split criteria.
   * @returns {[List<T>, List<T>]} An array containing two Lists: one with elements satisfying the predicate, and one with elements not satisfying the predicate.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Partitioning the list into even and odd numbers
   * const [evenNumbers, oddNumbers] = numberList.partition((item) => item % 2 === 0);
   *
   * console.log(numberList.toArray());  // [1, 2, 3, 4, 5]
   * console.log(evenNumbers.toArray());  // [2, 4]
   * console.log(oddNumbers.toArray());  // [1, 3, 5]
   */
  partition(predicate: (item: T) => boolean): [List<T>, List<T>] {
    const matching = [];
    const nonMatching = [];

    for (const item of this.#array) {
      if (predicate(item)) {
        matching.push(item);
      } else {
        nonMatching.push(item);
      }
    }

    return [new List(matching), new List(nonMatching)];
  }

  /**
   * Combines corresponding elements of two Lists into pairs.
   *
   * @template U - The type of elements in the other List.
   * @param {List<U>} otherList - The other List to zip with.
   * @returns {List<[T, U]>} A new List containing pairs of corresponding elements from the original and the other List.
   *
   * @example
   * // Creating lists of names and ages
   * const names = List.of('Alice', 'Bob', 'Charlie');
   * const ages = List.of(25, 30, 35);
   *
   * // Zipping the lists into pairs
   * const nameAgePairs = names.zip(ages);
   *
   * console.log(names.toArray());  // ['Alice', 'Bob', 'Charlie']
   * console.log(ages.toArray());  // [25, 30, 35]
   * console.log(nameAgePairs.toArray());  // [['Alice', 25], ['Bob', 30], ['Charlie', 35]]
   */
  zip<U extends Defined>(otherList: List<U>): List<[T, U]> {
    const thisArray = this.#array;
    const otherArray = otherList.toArray();
    const zippedArray: [T, U][] = [];

    const minLength = Math.min(thisArray.length, otherArray.length);
    for (let i = 0; i < minLength; i++) {
      zippedArray.push([thisArray[i], otherArray[i]]);
    }

    return new List(zippedArray);
  }

  /**
   * Returns a new List containing elements that are common to both the original List and another List.
   *
   * @param {List<T>} otherList - The other List to find the intersection with.
   * @returns {List<T>} A new List containing common elements.
   *
   * @example
   * // Creating lists of numbers
   * const list1 = List.of(1, 2, 3, 4, 5);
   * const list2 = List.of(3, 4, 5, 6, 7);
   *
   * // Finding the intersection of the lists
   * const intersectionList = list1.intersection(list2);
   *
   * console.log(list1.toArray());  // [1, 2, 3, 4, 5]
   * console.log(list2.toArray());  // [3, 4, 5, 6, 7]
   * console.log(intersectionList.toArray());  // [3, 4, 5]
   */
  intersection(otherList: List<T>): List<T> {
    const otherSet = new Set(otherList.toArray());
    const intersectionArray = this.#array.filter((item) => otherSet.has(item));
    return new List(intersectionArray);
  }

  /**
   * Returns a new List containing elements that are in the original List but not in another List.
   *
   * @param {List<T>} otherList - The other List to find the difference with.
   * @returns {List<T>} A new List containing elements from the original List that are not in the other List.
   *
   * @example
   * // Creating lists of numbers
   * const list1 = List.of(1, 2, 3, 4, 5);
   * const list2 = List.of(3, 4, 5, 6, 7);
   *
   * // Finding the difference of the lists
   * const differenceList = list1.difference(list2);
   *
   * console.log(list1.toArray());  // [1, 2, 3, 4, 5]
   * console.log(list2.toArray());  // [3, 4, 5, 6, 7]
   * console.log(differenceList.toArray());  // [1, 2]
   */
  difference(otherList: List<T>): List<T> {
    const otherSet = new Set(otherList.toArray());
    const differenceArray = this.#array.filter((item) => !otherSet.has(item));
    return new List(differenceArray);
  }

  /**
   * Converts the List to a plain JavaScript array.
   *
   * @returns {T[]} An array containing the elements of the List.
   *
   * @example
   * // Creating a list of numbers
   * const numberList = List.of(1, 2, 3, 4, 5);
   *
   * // Converting the list to an array
   * const arrayRepresentation = numberList.toArray();
   *
   * console.log(arrayRepresentation);  // [1, 2, 3, 4, 5]
   */
  toArray(): T[] {
    return this.#array.slice();
  }

  /**
   * Converts the List to its JSON representation, which is an array containing the elements.
   *
   * @returns {T[]} An array containing the elements of the List.
   *
   * @example
   * // Creating a list of strings
   * const stringList = List.of('apple', 'banana', 'cherry');
   *
   * // Converting the list to JSON
   * const jsonRepresentation = stringList.toJSON();
   *
   * console.log(jsonRepresentation);  // ['apple', 'banana', 'cherry']
   */
  toJSON(): T[] {
    return this.toArray();
  }

  /**
   * Converts the List to its string representation, which is a comma-separated string of elements.
   *
   * @returns {string} A comma-separated string representation of the elements in the List.
   *
   * @example
   * // Creating a list of colors
   * const colorList = List.of('red', 'green', 'blue');
   *
   * // Converting the list to a string
   * const stringRepresentation = colorList.toString();
   *
   * console.log(stringRepresentation);  // 'red,green,blue'
   */
  toString(): string {
    return this.toArray().toString();
  }
}
