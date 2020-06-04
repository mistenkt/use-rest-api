# kb-useApi
A customizable REST Api and data manager hook for your React application

## Why ?
There's a lot of boilerplating involved with getting your new project up and running. The data flow from api to your internal store is one of the most time-consuming parts. 

## Installation
`yarn add kb-useApi`

## Usage

1. Initialize the `ApiProvider` in your `App.js` file and provide the required params.

    ````jsx harmony
   import React from 'react';
   import {ApiProvider} from 'kb-useApi';
   
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
   import useApi from 'kb-useApi';
   
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
   
3. Producing content is very similar.

    ````jsx harmony
   import React from 'react';
   import useApi from 'kb-useApi';
   
   const UserIndex = () => {
       const [users, loading, produce] = useApi('users.list', {
           onProduced: result => console.log('on produced callback'),
           onProducedFailed: error => console.log('on failed callback')  
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
   
   #API
   
   ### `<ApiProvider/>`
   
   Provider wrapper for you application. Set it at top level.
   
   #### Required Params:
    - `resources` (object) - The resources you wish to interact with
    
   #### Optional Params:
    - `defaultActions` (object) - Overwrite some or all of the default actions provided by the library.
    
        ```jsx harmony
        // These are the default actions of the library
      
        const defaultActions = {
            list: {
                method: 'GET',
                endpoint: '/:endpoint',
                getState: (state, resource) => state[resource] || [],
            },
            single: {
                method: 'GET',
                endpoint: '/:endpoint/:id',
                getState: (state, resource, id) =>
                    Array.isArray(state[resource])
                        ? state[resource].find((a) => a.id === id)
                        : null,
            },
            create: {
                method: 'POST',
                endpoint: '/:endpoint',
            },
            update: {
                method: 'POST',
                endpoint: '/:endpoint',
            },
            delete: {
                method: 'GET',
                endpoint: '/:endpoint/:id/delete',
            },
        };
        ```
   
