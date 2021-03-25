# Subscription - Graphql

- Resolver에서 변경사항이나 업데이트를 수신할 수 있게 해준다

- graphql-subscriptions 패키지를 사용한다

- ```typescript
  const pubsub = new Pubsub()
  
  @Subscription(returns => String)
  someFunction()
      return pubsub.asyncIterator("ListeningEventName") // trigger을 위한 argument
  }
  ```

- 일반적으로 서버는 HTTP 프로토콜로 실행되나, Subscription은 실시간 통신을 위해 Websocket 프로토콜을 사용한다

  - 즉, http://domainName 이 아닌 ws://domainName에 접근을 시도함
  - 그러므로 Web Socket을 활성화해야 Subscription을 사용할 수 있다

- Mutation과 Query를 위해 HTTP 요청을 받을 수 있는 동시에 Subscription을 위해 Web Socket 역시 활성화 되도록 서버를 구현해야 하는 것

- 필요한 절차

  - websocket을 활성화한다

  - ```typescript
    // app.module.ts
    GraphQLModule.forRoot({
        ...,
        installSubscriptionHandlers: true, // 이것을 추가함
        context: ({req}) => ({user: req["user"]}) // 여기서 user 라는것의 property를 읽을 수 없다고 출력될것임 - 그 이유는 아래에서 설명
    })
    ```

  - 문제가 발생하는 이유는 HTTP에는 request가 있고 cookie를 주고 받고 하는 등의 행위가 있으며 stateless connection이므로 요청 응답 후 종료된다

  - 하지만 web socket에는 request라는 개념이 없고 cookie를 주고받고를 할 수 없으며, 한번 연결되면 지속적으로 연결된 상태를 유지하게 된다

  - 즉, context에서의 req는 http프로토콜에서는 아무런 문제가 없으나, websocket프로토콜로에서는 request가 없기 때문에 문제가 발생하는 것

  - **중요! - Websocket의 connection을 통해 보내지는 query, variables, operationName, context 등은 처음 연결될 때 단 한번만 보내지고 그 이후로는 보내지지 않는다**

  - http는 매 request마다 토큰을 보내고 연결 후 통신이 끊기지만, websocket은 연결을 시작할 때 단 한 번만 토큰을 보내고 그 연결이 계속 유지된다

