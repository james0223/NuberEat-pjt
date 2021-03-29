# When a library does not support ts

1. Try `npm i @types/libraryName` ex) `npm i @types/react-router-dom`

   - If the library exists on DefinitelyTyped library, it will be set up for use in typescript

2. If the dependency does not exist, do the followings

   - ```typescript
     // react-app-env.ts
     
     
     /// <reference types="react-scripts" />
     declare module "react-router-dom"
     ```

   - When using this method, typescript is not going to be able to help you when coding ex) showing up options of functions, etc