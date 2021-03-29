import { ApolloClient, InMemoryCache, makeVar } from '@apollo/client';

// Reactive variable 만들기
export const isLoggedInVar = makeVar(false) // 초기값 설정

export const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  // Apollo Client stores the results of its GraphQL queries in a normalized, in-memory cache. 
  // This enables your client to respond to future queries for the same data without sending unnecessary network requests.
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // 여기서 key의 이름은 반드시 query의 이름과 같아야 한다
          isLoggedIn: {
            read() {
              return isLoggedInVar // local storage에 토큰이 존재한다면 로그인된 상태라고 알려주는 것
            }
          }
        }
      }
    }
  })
});