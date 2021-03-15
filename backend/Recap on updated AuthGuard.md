# Recap on updated AuthGuard

- Metadata를 설정해주는 Decorator 생성 - role.decorators.ts

  - Metadata란 resolver의 extra data 이다

- 일부 resolver은 metadata를 지니지 않을 것이고, 일부 resolver는 role.decorator.ts에서 부여해주는 roles라는 이름의 metadata를 가질 것이다
  - ```typescript
    export const Role = (roles: AllowedRoles[]) => SetMetadata("roles", roles)
    ```

  - 위의 코드는 "roles"라는 key에 roles 배열이 저장하는 것

- Authguard를 APP_GUARD라는 NEST가 제공해주는 기능을 통해 모든 resolver에서 작동하도록 설정한다

- resolver에 metadata나 role이 없으면 public, 있다면 private 이 된다

- 이후엔 auth.guard의 코딩된 설정에 따른다