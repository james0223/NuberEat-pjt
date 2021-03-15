# Computed Field(Dynamic Field)

- 데이터베이스에 저장되지 않는 Field
- Request가 요청될 때마다 새로이 계산되는 Field
- 주로 로그인된 사용자의 상태에 따라 계산되는 Field
- ex) Category의 RestaurantCount 와 같은 Field
  - Category Resolver에 요청이 들어올 때마다 카테고리별 Restaurant의 수를 계산해준다

