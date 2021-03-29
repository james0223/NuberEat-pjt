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
   
5. `npm i -g apollo && npm i apollo`

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



## 3. React Router Dom

- Most used router dependency for React

1. `npm i react-router-dom`
2. Create routers :)