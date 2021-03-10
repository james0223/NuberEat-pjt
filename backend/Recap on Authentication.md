# Recap on Authentication



## 1. Part 1

1. Client측에서 request를 보낼 때 header에 token을 담아서 보냄
2. header는 http 기술이므로 그 기술을 사용하기 위해 middleware를 생성했음
   - 프로젝트내의 jwtmiddleware
3. 이 middleware는 우리가 만든 jwtService.verify()를 사용하여 해당 token을 decode함
4. decode과정을 통해 반환된 값 중 id가 있다면 제대로 된 token임을 증명하는 것이며, 해당 id값을 통해 요청을 보낸 유저를 찾아냄 - userService의 findById() - 해당 함수는 typeorm의 findOne()함수 사용
5. 만약 유저가 있다면 그 유저를 request.object에 붙여서 보냄
6. 이 jwtmiddleware는 미들웨어이기 때문에 다른 resolver들보다 먼저 request에 접근하고, 해당 request의 형태를 변형할 수 있음
7. jwtmiddleware에 의해 업데이트된 request를 모든 resolver가 활용할 수 있게 되는 것

8. 만약 토큰이 잘못되었거나 존재하지 않는 유저라면 request에 그 어떤 것도 붙여보내지 않게 되므로 resolver에서는 이에 근거하여 어떤 식으로 반응을 할 지 결정할 수 있게 됨



## Part 2

- graphql, 즉 apollo서버의 context는 모든 resolver에게 정보를 보낼 수 있는 property임
- 모든 request마다 context가 call됨
- 이 context를 함수로 만들면 이는 request object를 인자로 받아가게 됨
- 즉, 가장 먼저 jwtmiddleware를 거치고(여기선 request user인 상태) context를 거친 후 (이젠 context user가 됨) users resolver의 Guard를 마주하게 된다
- Guard는 함수의 기능을 보충해주며 내부의 canActivate함수는 true나 false 값을 반환하며, 이 값에 기반하여 request를 마저 진행시킬지 말지 결정한다
  - 중요한 것은, ExecutionContext(NestJS의 context)를 가져다 GqlExecutionContext로 바꿔야 한다는 것

- 이후 내부에 user라는 이름의 필드가 있는지 확인하고 없다면 jwt미들웨어에서 해당 유저를 찾지 못했거나 토큰이 유효하지 않다는 의미이므로 false를 return하여 request를 정지시킴

- 만약 true값을 반환했다면 @AuthUser() 데코레이터가 실행되어 Guard와 마찬가지로 ExecutionContext를 GqlExecutionContext로 변경 후, 이를 resolver에 넘겨줌으로써 resolver가 해당 유저에 대한 조치를 취할 수 있게 된다
  - 데코레이터는 무조건 value를 return하는데 여기선 User 인스턴스를 리턴하는 것