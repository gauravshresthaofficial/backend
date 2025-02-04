const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());

morgan.token("post-body", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : "";
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-body"
  )
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api", (request, response) => {
  response.send("<h1>Hello World</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  let total = persons.length;
  let date = new Date();
  response.send(
    `<p>Phone book has info for ${total} people. <br/> ${date}</p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  let id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (!person) {
    response.status(404).end();
  } else {
    response.json(person);
  }
});

app.delete("/api/persons/:id", (request, response) => {
  let id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  console.log(persons);

  response.status(204).end();
});

const generateId = () => {
  const minId = 100000;
  const maxId = 999999;
  let newId;
  do {
    newId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  } while (persons.some((person) => person.id === newId.toString()));
  return newId.toString();
};

app.post("/api/persons", (request, response) => {
  let newPerson = request.body;

  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({
      error: "Name Missing",
    });
  }

  if (persons.find((person) => person.name === newPerson.name)) {
    return response.status(409).json({
      error: "name must be unique",
    });
  }

  newPerson = { id: generateId(), ...newPerson };

  persons = persons.concat(newPerson);

  console.log(persons);
  response.json(newPerson);
});

const PORT = 3001;
app.listen(PORT);
console.log(`Server is running in PORT ${PORT}`);
