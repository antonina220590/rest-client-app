# REST Client

## Project description

This REST Client project aims to develop a light-weight versions of Postman.
Key pages of the application include:

- Login and Registration pages 🖥️
- Main page 🏠
- REST Client page 📋
- Variables
- History

The project is being developed as the final task of the RS school's JS / React course. Its main goals are:

- consolidation of the knowledges gained during this course and,
- improvement of teamwork skills.

Our team:

- [antonina220590](https://github.com/antonina220590)
- [gbogdanova](https://github.com/gbogdanova)
- [tatidem](https://github.com/tatidem)

### Technology stack

#### Front-end:

- HTML
- TailwindCss
- TypeScript
- Webpack
- React
- Next JS
- Vitest

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build the application:

```bash
npm run build
```

Compiles the application for production deployment. It optimizes the app for the best performance.

### Lint the project files

```bash
npm run lint
```

Runs ESLint to find and fix problems in your JavaScript and TypeScript files within the app/ directory.

### Format the project files

```bash
npm run prettier:fix
```

Runs Prettier to format code.

### Run Tests

```bash
npm run test
```

Executes the test suites of the application using Vitest.

### Run Tests Coverage

```bash
npm run test:coverage
```

Executes the test coverage.

## REST Requests Examples

### GET

```
##### endpoint url:
https://rickandmortyapi.com/api/character


##### headers (optional)

Content-Type: application/json

##### queries (optional)

key: name
value: Rick

```

### POST

```
##### endpoint url:
https://jsonplaceholder.typicode.com/posts

##### body:

{
  "title": "foo",
  "body": "bar",
  "userId": 1
}

##### headers

Content-Type: application/json

```

### PUT

```

##### endpoint url:

 https://jsonplaceholder.typicode.com/posts/1

##### body:

{
  "id": 1,
  "title": "UPDATED Title Example",
  "body": "This is the updated body content.",
  "userId": 1
}

##### headers

Content-Type: application/json

```

### GET with VARIBALES

```

##### endpoint url:

URL: {{baseUrl}}/posts/{{postId}}


##### Variables

key: baseUr  value: https://jsonplaceholder.typicode.com
key: postId  value: 2

##### headers

Content-Type: application/json

```
