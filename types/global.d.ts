interface Set<T> {
  /** 该方法采用一个集合并返回一个包含该集合和给定集合中元素的新集合。 */
  intersection(other: Set<T>): Set<T>

  /** 该方法采用一个集合并返回一个布尔值，指示该集合是否与给定集合没有共同的元素。 */
  isDisjointFrom(other: Set<T>): boolean

  /** 该方法采用一个集合并返回一个新集合，其中包含此集合或给定集合中的元素，但不在两者中。 */
  symmetricDifference(other: Set<T>): Set<T>

  /** 该方法采用一个集合并返回一个新集合，其中包含此集合中的元素，但不包含给定集合中的元素。 */
  difference(other: Set<T>): Set<T>

  /** 方法采取一个集合并返回一个新的集合，该集合包含该集合和给定集合中的一个或两个元素。 */
  union(other: Set<T>): Set<T>
}

interface ViewTransition {
  finished: Promise<void>
  ready: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition(): void
}

interface Document {
  startViewTransition(callback: () => void): ViewTransition
}

interface FontFaceSet {
  add(font: FontFace): void
}
