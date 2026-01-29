A full-stack application using Node.js with Prisma for the backend and React.js for the frontend.

Table of Contents

Prerequisites

Setup Backend

Setup Frontend

Environment Variables

Database Setup

Running the Application

Seeding the Database

API Documentation

Prerequisites

Make sure you have the following installed:

Node.js
 >= 18.x

npm
 or yarn

PostgreSQL
 (or your preferred DB supported by Prisma)

Git

Setup Backend

Clone the repository:

git clone https://github.com/Leexdesaint/mdt.git
cd your-project


Install backend dependencies:

cd backend
npm install
# or
yarn install


Install Prisma CLI (if not installed globally):

npm install -D prisma
# or
yarn add -D prisma

Setup Frontend

Navigate to frontend folder:

cd frontend


Install frontend dependencies:

npm install
# or
yarn install


Start the React development server:

npm start
# or
yarn start


Frontend will typically run on http://localhost:3000

Environment Variables

Create a .env file in your backend root folder:

# .env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public"
PORT=3000
JWT_SECRET="your_jwt_secret_here"


Note: Adjust DATABASE_URL according to your PostgreSQL credentials.

Database Setup

Run Prisma migrations:

npx prisma migrate dev --name init


Generate Prisma client:

npx prisma generate


Optional: open Prisma Studio to view DB:

npx prisma studio

Running the Application

Backend:

cd backend
npm run dev
# or
yarn dev


Frontend:

cd frontend
npm start
# or
yarn start


Backend default: http://localhost:3000

Frontend default: http://localhost:5173
 or http://localhost:3000
 depending on Vite or Create React App

Seeding the Database

If you have a Prisma seed script:

npm run seed
# or
yarn seed


This will populate your database with initial data for testing.

API Documentation

API routes are documented using Swagger.

Access Swagger UI at:

http://localhost:3000/api-docs
