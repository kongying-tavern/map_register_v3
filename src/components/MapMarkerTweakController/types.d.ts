export declare namespace Tweak {
  enum Prop {
    Title = 'title',
    Content = 'content',
    RefreshTime = 'refreshTime',
    HiddenFlag = 'hiddenFlag',
    Extra = 'extra',
    ItemList = 'itemList',
  }

  type Type =
    | 'update'
    | 'replace'
    | 'replaceRegex'
    | 'prepend'
    | 'append'
    | 'trimLeft'
    | 'trimRight'
    | 'removeLeft'
    | 'removeRight'
    | 'merge'
    | 'insertIfAbsent'
    | 'insertOrUpdate'
    | 'removeItem'
    | 'preserveItem'
}
