# Request의 여정



## HTTP

- HTTP를 통해 웹사이트로 request가 오고, 가장 먼저 마주하게 되는 것은 jwt 미들웨어이다
- jwt 미들웨어는 request의 header 부분에서 토큰을 가져와서 유저를 찾고, 찾았따면 해당 유저를 request에 넣었다
- 그 후 graphQL context function (app.module.ts)이 request 내부에서 유저를 가져와서 context.user에 넣어주었다
  - 이것 때문에 auth.guard.ts에서 const user = gqlContext["user"]를 통해 유저를 받아오는 것



## Web Socket

- HTTP와 달리, jwt 미들웨어를
- 그렇다면 유저를 어디에 보관하고 찾는가? => context



## 정리

- Web socket 동시활용의 단계

1. jwt middleware 제거
2. context를 통해 guard에게 필요한 정보 전송(token 등)
3. 이제 Guard가 jwt 미들웨어가 하던일을 넘겨받는다 (user 찾기 및 저장)

