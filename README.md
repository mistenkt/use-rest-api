# use-rest-api
A customizable REST Api and data manager hook for your React application

## Installation
`yarn add @mistenkt/use-rest-api`

## Usage

1. Initialize the `ApiProvider` in your `App.js` file and provide the required params.

    ````jsx harmony
   import React from 'react';
   import {ApiProvider} from '@mistenkt/use-rest-api';
   
   const apiResources = {
       users: {
           endpoint: '/user'
       },
       posts: {
           endpoint: '/post',
       }
   };
   
   const App = () => {
       return (
           <ApiProvider
               baseUrl="https://locahost/api"
               resources={apiResources}
           >
               {/* The rest of your app*/}
           </ApiProvider>
       )
   };
   
   export default App;
    ````
    
2. Use the `useApi` hook inside your containers/components that want to consume api data

    ````jsx harmony
   import React from 'react';
   import {useApi} from '@mistenkt/use-rest-api';
   
   const UserIndex = () => {
       const [users, loading] = useApi('users.list');
       
       if(loading) return (
           <div>Loading...</div>
       )
       
       if(!users && !loading) return (
           <div>No users</div>
       )
   
       return (
           <ul>
               {users.map(user => (
                   <li key={user.id}>{user.name}</li>
               ))}
           </ul>
       )   
   }
   
   export default UserIndex;
   ````
   
3. To send create/update request to the api use the `useProduce` hook.

    ````jsx harmony
   import React from 'react';
   import {useApi, useProduce} from '@mistenkt/use-rest-api';
   
   const UserIndex = () => {
       const [users, loading] = useApi('users.list');
       const [produce, produceLoading, validationErrors] = useProduce({
           onSuccess: data => console.log('Success callback', data),
           onFail: err => console.log('Fail callback', data),
           onValidationError: errors => console.log('Validation error callback', errors)
       });
   
       const createUser = () => {
           produce('users.create', {
               name: 'foo'
           })
       };
       
       if(loading) return (
           <div>Loading...</div>
       )
       
       if(!users && !loading) return (
           <div>No users</div>
       )
   
       return (
           <>
               <ul>
                   {users.map(user => (
                       <li key={user.id}>{user.name}</li>
                   ))}
               </ul>
               <button onClick={createUser}>Create user</button>
           </>
       )   
   }
   
   export default UserIndex;
   ````
   
## Api Documentation

Ful api documentation coming soon.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
