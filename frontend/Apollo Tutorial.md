# Apollo Tutorial



## 1. Local-only fields

- Your Apollo Client queries can include **local-only fields** that *aren't* defined in your GraphQL server's schema. The values for these fields are calculated locally using any logic you want, such as reading data from `localStorage`.
- A single query can include both local-only fields *and* fields that are fetched from your GraphQL server.
- local state를 다루는데 활용된다 ex) 로그인된 상태, 다크모드, 유튜브의 volume
  - frontend도 유저가 로그인된 상태인지를 알아야 로직에 맞는 행위를 할 수 있기 때문
  - 특히 다크모드는 서버에 보낼 필요가 없는 말 그대로 frontend만의 state이다



## 2. Reactive Variables

- New in Apollo Client 3, **reactive variables** are a useful mechanism for storing local state outside of the Apollo Client cache. 
- Because they're separate from the cache, reactive variables can store data of any type and structure, and you can interact with them anywhere in your application without using GraphQL syntax.
- **Most importantly, modifying a reactive variable triggers an update of every active query that depends on that variable, as well an update of the react state associated with any variable values returned from the `useReactiveVar` React hook.** A query depends on a reactive variable if any of the query's requested fields defines a [`read` function](https://www.apollographql.com/docs/react/caching/cache-field-behavior/#the-read-function) that reads the variable's value.

