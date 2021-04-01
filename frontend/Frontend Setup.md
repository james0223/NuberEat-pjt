# Frontend Setup



## 1. Tailwind css

1. `npx create-react-app frontend --template=typescript`

2. `npm i tailwindcss`

3. `tailwind css IntelliSense` for vs code extensions

4. `npm i postcss autoprefixer` to extend tailwindcss 
   - postcss - post process css
     - create postcss.config.js file and set it up to add tailwind as a postcss plugin
     - tailwind를 일반 css파일로 빌드해줌
   - autoprefixer - 브라우저가 지원하지 않는 class를 지원하도록 보조해줌

5. `npx tailwindcss init` - tailwind.config.js 생성
   - tailwind를 extend(customize)하는데 사용 + tailwind css IntelliSense가 이걸 참조함
   - 

6. 이 상태로는 React에 tailwind css를 가져올 수 없다 - 빌드를 해야함

   - package.json에 추가

   - ```json
     "scripts": {
         "tailwind:build": "tailwind build ./src/styles/tailwind.css -o ./src/styles/styles.css",
         "start": "npm run tailwind:build & react-scripts start"
     }
     ```
   ```
     
   - tailwind:build 를 입력하면 tailwind build가 실행될 것이며 이는 공백 이후의 경로를 빌드 대상(input)으로 삼고 다음 공백과 -o 이후의 경로를 빌드 결과물 출력 경로(output)로 한다
   
   - start 는 npm run start시 자동으로 선 빌드 후 실행하도록 설정해 놓은 것
   ```

7. index.tsx에서 빌드된 css파일 import



## 2. Apollo & Graphql

1. `npm i @apollo/client graphql`

2. src 내부에 apollo.ts 생성

   - ```typescript
     import { ApolloClient, InMemoryCache } from '@apollo/client';
     
     const client = new ApolloClient({
       uri: 'http://localhost:4000/graphql', // backend port 주소
       cache: new InMemoryCache()
     });
     ```

   - 

3.  index 설정

   - ```typescript
     import React from 'react';
     import ReactDOM from 'react-dom';
     import { ApolloProvider } from '@apollo/client';
     import App from './App';
     import reportWebVitals from './reportWebVitals';
     import "./styles/styles.css"
     import { client } from './apollo';
     
     ReactDOM.render(
       <React.StrictMode>
         <ApolloProvider client={client}>
           <App />
         </ApolloProvider>
       </React.StrictMode>,
       document.getElementById('root')
     );
     ```

4. apollo client dev tools 크롬 익스텐션 설치

   - frontend에서 backend의 schema를 볼 수 있게 해줌
   



## 4. Apollo Tooling

1. `npm i -g apollo && npm i apollo`

   - graphql에 mutation을 보낼 때, typescript로 데이터를 보호하기 위한 dependency - global과 프로젝트 내부 모두 설치

     - ```typescript
       interface ILoginForm {
           email: string
           password: string
       }
       
       const onSubmit = () => {
               const { email, password } = getValues()
               loginMutation({
                   variables: {
                       email,
                       password
                   }
               })
           }
       ```

     - 위와 같이 보내면 password: 12345 와 같이 int 형태로 보내져도 막을 방법이 없다

     - 이를 해결하기 위한 dependency임
     
   - Apollo Tooling은 backend에서 mutation, query, responses, input type들을 전부 다 typescript 정의로 자동으로 생성해준다

     - 즉, apollo로 보내는 data는 백엔드에서 원하는 데이터타입의 데이터임을 확신할 수 있으며
     - response를 받으면 response 또한 frontend에서 예상하는 타입의 response임을 확신할 수 있다

   - 모든 것은 결국 backend에서 제작한 dto에서 시작된다

     - dto 덕분에 backend에서 요구하는 input의 데이터와 타입을 명시적으로 알 수 있고
     - dto 덕분에 frontend에 보내질 response의 데이터와 타입을 확신할 수 있는 것

2. apollo.config.js 파일 생성

- apollo는 frontend로 모든 schema를 가져오는 것이 아님
- 경로가 설정된 파일들의 gql`` 코드만을 체크하고 해당 코드 내부의 graphql mutation이나 query에 해당되는 schema만을 가져오는 것이다
  
  - 즉, 코드로 작성된 것에 대해서만 typescript schema를 가져오는 것
- 경로 설정은 includes로 한다

- ```javascript
  module.exports = {
      client: {
          // includes - 해당 경로에 있는 파일들의 tagname속에 들어있는 코드들 찾아서 필요한 schema들만을 가져온다 - 서버와 연결되는 최초의 순간에 자동으로 schema를 불러오는 query가 실행됨
          includes: ["./src/**/*.tsx"], // **는 한번만 해도 폴더가 여러개여도 알아서 탐색한다 즉, .src/**/**/*.tsx 와 같이 작성할 필요가 없는 것
          tagName: "gql",
          service: {
              name: "nuber-eats-backend",
              url: "http://localhost:4000/graphql" // backend의 url
          }
      }
  }
  ```



3. `apollo client:codegen mytypes.d.ts --target=typescript` 실행
   
   - 자동으로 모든 gql에 대한 interface를 생성해준다
   
   - mytypes.d.ts는 생성될 폴더 이름이다
   
   - 이후 생성된 interface는 다음과 같이 사용할 수 있다
   
   - ```typescript
     const [loginMutation, {loading, error, data}] = useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION)
     ```
   

4. 위와 같이 하면 매 source file 옆에 interface 파일이 생성된다. 이를 하나로 묶으려면 --output flat을 추가한다
   - ``apollo client:codegen --target=typescript --outputFlat``



## 4. React Router Dom

- Most used router dependency for React

1. `npm i react-router-dom`
2. Create routers :)