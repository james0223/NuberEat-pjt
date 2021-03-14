# Testing



## 1. Unit testing

- 테스트하고자 하는 유닛(Service)의 복제품 모듈을 생성하여 테스트를 진행

- Unit testing의 핵심은 가능한 한 개별 테스트들을 독립된 환경에서 시행하는 것

- Jest는 typescript가 아니기 때문에 import시 경로가 "src/~"인 것들을 src에서 자동으로 찾지 못함(버그일 수 있음) - 일반 javascript는 import시 "../../src"식으로 하기 때문

  - 이에 따라 package.json의 jest에 다음을 추가한다

  - ```json
    "moduleNameMapper": {
          "^src/(.*)$": ["<rootDir>/$1"]
        }, // 이 의미는 만약 어떤 import대상의 path가 "src"로 시작한다면 rootDir을 참조하라는 것이다 - 정규표현식임
    ```



### Mocking

- 원본 서비스가 typeorm의 Repository 등에 의존한다면 테스트상에서도 이를 마련해줘야 하는데, 실제의 것을 마련해주지 않고 Mock을 제공해주는 것
- Mock의 정의: 가짜 함수의 실행, 가짜 클래스의 실행
- Mock을 사용하는 이유: 실제 연동되는 서비스나 유닛들을 불러오면 이는 유닛테스트의 고립성, 단독성의 원칙에 어긋나기 때문
- 그렇다면 가령 createAccount()를 실행할 경우, 데이터베이스에 유저 생성을 시도해봐야 하는데, 실제 데이터베이스에 접근하지 않는데 어떻게 테스트하는가? => 이것이 Mocking을 하는 이유!!
- **Mock은 함수의 return value를 속일 수 있기 때문!**



### Spying on a function

- Mock을 할 수 없을 때 spy를 사용한다
  - ex) Service내의 특정 함수 B가 다른 함수A에 의존할 때, 유닛테스트를 진행하기 위해서는 Bㄹ를 테스트할 때 A가 사용되게 됨
  - A는 또다른 유닛테스팅의 대상이므로, A를 Mock해선 안되고 spy를 한다
- 



### 유닛테스트시 주의할점!

- 전체 결과의 흐름에 따라 원하는 행위가 이루어지는지를 테스트하는 것이 아님
- 코드의 각 줄마다 해당 줄이 우리가 의도한 대로 작동하는지를 테스트해야함
- 즉, 각 줄을 고립된 상태로 테스트해야함!





## 2. E2E(End to End) Testing 

- Resolver를 테스트함
- NEST는 test 폴더에 E2E test를 위한 파일을 준비해줌
- 이를 각 모듈에 맞게 새로 생성하고 이름바꿔서 테스트하면 댐
- 특이점이라면 전체 Appmodule을 import해서 사용한다는 것
- e2e의 테스트를 위한 설정은 test폴더 내의 jest-e2e.json을 활용한다

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": ["<rootDir>/../src/$1"]
  } // rootDir이 "."으로 설정되어있는데 그곳은 바로 test폴더 내부이다
    // 따라서 위로 한번 나가서 src로 들어간 후, 해당 경로를 따라가도록 설정해주어야 한다
}
```



