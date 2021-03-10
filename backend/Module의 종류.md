# Module의 종류

## 1. Static module

- 어떤 설정도 되어있지 않은 모듈



## 2. Dynamic module

- forRoot()는 dynamic module을 return함
- dynamic module이란 설정이 적용되어 있는 모듈
- 하지만 Dynamic 모듈도 결국 설정이 적용된 Static모듈인 것이다



## 3. Global module

- 이건 종류는 아님

- 각 모듈들에서 imports 내부에서 불러오지 않아도 자유롭게 사용 가능한 모듈을 지칭함

- ```typescript
  @Module({})
  @Global() // 모듈에 이 데코레이터를 추가하면 글로벌모듈이 된다
  ```

- 제3자 모듈들은 각기 방법이 있다 ex) isGlobal: true 로 설정하기