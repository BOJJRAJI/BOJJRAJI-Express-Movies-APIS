const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API1
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
   SELECT movie_name as movieName from movie ORDER BY movie_id
   ;`;

  const movieNames = await db.all(getMovieNamesQuery);

  response.send(movieNames);
});

//API2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  console.log(request.body);
  const addMovieQuery = `
   INSERT INTO  movie 
   (director_id,movie_name,lead_actor)
   VALUES
   (
    ${directorId},
    '${movieName}',
    '${leadActor}'
   )
   ;`;

  await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieDetailsQuery = `
   SELECT
    movie_id as movieId,
    director_id as directorId,
    movie_name as movieName,
    lead_actor as leadActor
    from movie 
    WHERE 
    movie_id=${movieId}
   ;`;

  const movieDetails = await db.get(getMovieDetailsQuery);
  console.log(movieDetails);
  response.send(movieDetails);
});

//API4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;

  console.log(directorId, movieName, leadActor, movieId);

  const updateMovieQuery = `
   UPDATE movie 
   SET 
   director_id=${directorId},
   movie_name='${movieName}',
   lead_actor='${leadActor}'
   where 
   movie_id=${movieId}
   ;`;

  await db.run(updateMovieQuery);

  response.send("Movie Details Updated");
});

//API5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
   DELETE from movie where movie_id=${movieId}
   ;`;

  await db.run(deleteMovieQuery);

  response.send("Movie Removed");
});

//API6
app.get("/directors/", async (request, response) => {
  const getDirectorDetailsQuery = `
   SELECT director_id as directorId,
   director_name as directorName
   from director
    ORDER BY directorId
   ;`;

  const directorDetails = await db.all(getDirectorDetailsQuery);

  response.send(directorDetails);
});

//API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getMovieNamesQuery = `
   SELECT movie_name as movieName from movie
   WHERE director_id=${directorId}
   ORDER BY movie_id
   ;`;

  const movieNames = await db.all(getMovieNamesQuery);

  response.send(movieNames);
});

module.exports = app;
