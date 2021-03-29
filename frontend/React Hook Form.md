# React Hook Form

- 3rd party dependency for making forms for React

- `npm i react-hook-form`

- ```typescript
  // Integrating typescript with react hook form
  // 인터페이스는 클래스에서 구현부가 빠졌다고 이해하면 편하다. 
  // 즉, 어떠한 객체가 이러이러한 프로퍼티 혹은 메소드를 가진다고 선언하는 것이다. 
  // 실질적인 구현은 이를 구현한다고 선언하는 클래스에 맡긴다.
  interface IForm {
      email: string;
      password: string;
  }
  
  export const LoggedOutRouter = () => {
      // react hook form 을 사용하면 하나의 hook으로 React 내 모든 form을 관리할 수 있게 된다
      const { register, watch, handleSubmit, errors } = useForm<IForm>()
      const onSubmit = () => {
          console.log("submitted!")
      }
      const onInvalid = () => {
          console.log("can't create account")
      }
      return (
          <div>
        <h1>Logged Out</h1>
        <form 
        // handleSubmit은 첫 번째 인자로 validation을 통과했을 때 실행할 함수를 받고, 두 번째 인자로 실패했을 때 실행할 함수를 받는다
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        >
          <div>
            <input
              // ref에 register를 담는다
              ref={register({
                required: "This is required",
                // validation은 validate나 pattern을 사용하여 진행할 수 있다
                // validate: (email: string) => email.includes("@gmail.com")
                pattern: /^[A-Za-z0-9._%+-]+@gmail.com$/,
              })}
              name="email"
              type="email"
              placeholder="email"
            />
            {errors.email?.message && (
              <span className="font-bold text-red-600">
                  {errors.email?.message}
              </span>
            )}
            {
                errors.email?.type === "pattern" && (
                    <span className="font-bold text-red-600">
                        Only Gmail allowed
                    </span>
                )
            }
          </div>
          <div>
            <input
              ref={register({ required: true })}
              name="password"
              type="password"
              required
              placeholder="password"
            />
          </div>
          <button className="bg-yellow-300 text-white">Submit</button>
        </form>
      </div>
      )
  }
  ```

- 