require("dotenv").config();
const express = require("express");
const app = express();
// const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

let persons = [];

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:", request.path);
  console.log("Body:", request.body);
  console.log("---");
  next();
};

app.use(express.json());
app.use(requestLogger);
app.use(cors());
app.use(express.static("dist"));

// const generateId = () => {
//   const minId = 100000;
//   const maxId = 999999;
//   let newId;
//   do {
//     newId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
//   } while (persons.some((person) => person.id === newId.toString()));
//   return newId.toString();
// };

app.get("/api", (request, response) => {
  response.send("<h1>Hello World</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      console.log(request.params.id, "id");
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  console.log("body", body);

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "Name or number missing" });
  }

  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        return response.status(409).json({ error: "Name must be unique" });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person
        .save()
        .then((savedPerson) => response.json(savedPerson))
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  let id = request.params.id;
  console.log("delete", id);

  Person.findByIdAndDelete(id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      let date = new Date();
      response.send(
        `<p>Phone book has info for ${count} people. <br/> ${date}</p>`
      );
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
