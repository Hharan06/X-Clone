YouTube Video Link: https://youtu.be/AwH6bqcInDw?si=Mu5zrGjR4amJJbaj

Install node js lts from website
npm init -y   - To create package.json
npm i express mongoose dotenv

create backend folder and inside create server.js

backend
   |
   |_____ server.js

In package.json change the scripts to "start": "node backend/server.js"  # this serves as an entry point
also change "main" to backend/server.js

npm i -D nodemon  # we can run only with node but in development if we change something we dont have to restart server if we have nodemon

Add "dev": "nodemon backend/server.js" in scripts

npm run dev  # runs the server

npm i jsonwebtoken bcryptjs cors cookie-parser cloudinary

in package.json if we add "type": "module" then we can import module normally (i.e import express from "express")

We cant explicitly give pot number so we use dotenv

create a .env file outside and give your port number and access that in server

It follows MVC pattern so create models controllers and routes folder inside backend

In auth.route.js we will have lot of routing so we use controllers to handle and export it to auth.route.js

It is not feasible to use local system database so we use mongoDB atlas

Get the link and connect it using mongoose 

You can write database schema in models using mongoose

Complete your backend

Now create frontend folder

Then cd frontend then npx create-react-app .

npm install -D tailwindcss@3.4.12

npx tailwindcss init -p

Modify tailwind.config.js to this

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}

Replace index.css with 
@tailwind base;
@tailwind components;
@tailwind utilities;

Install Daisyui

npm i -D daisyui@latest

Import import daisyUIThemes from "daisyui/src/theming/themes"; in tailwind.config.js

Add require('daisyui'), to plugins in tailwind.config.js 

Daisyui is like bootstrap we can use it library components

In tailwind.config.js import daisyUIThemes from "daisyui/src/theming/themes";

Add theme in tailwind.config.js and in index.html

npm i react-router-dom this helps to use all routers in single page not going to another page

npm i react-icons to use icons

npm install @tanstack/react-query

Replace the index.js with the content in this index.js for newer projects

import {Routes, Route} from "react-router-dom" in App.js

React Course: https://youtu.be/2kL28Qyw9-0?si=oN43kn9-MPNZ6odh

After completing frontend install tanstack react query

npm i @tanstack/react-query and import it in index.js

    import {
      QueryClient,
      QueryClientProvider,
      useQuery,
    } from '@tanstack/react-query'

    const queryClient = new QueryClient({
      defaultOptions : {
        queries : {
          refetchOnWindowFocus : false
        }
      }
    });

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </React.StrictMode>
    );

Using this tanstack we can send data from frontend to server using fetch which will send to the respective routes and generate response which is brought back to frontend
