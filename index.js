const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();

app.use(express.json());//na saida 
app.use(cors());
app.use(bodyparser.json());//na entrada 

var conString = config.urlConnection;

var client = new Client(conString);

client.connect((err) => {
  if (err) {
    return console.error('Não foi possível conectar ao banco.', err);
  }
  client.query('SELECT NOW()', (err, result) => {
    if (err) {
      return console.error('Erro ao executar a query.', err);
    }
    console.log(result.rows[0]);
  });
});

app.get("/", (req, res) => {
  console.log("Response ok.");//vai para powershell
  res.send("Ok – Servidor disponível.");//vai p browser
});

app.get("/familias", (req, res) => {
  try {
    client.query("SELECT * FROM familias", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      res.send(result.rows);
      console.log("Rota: get familias");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/familias/:id", (req, res) => {
  try {
    console.log("Rota: familias/" + req.params.id);
    client.query(
      "SELECT * FROM familias WHERE id = $1", [req.params.id],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de SELECT id", err);
        }
        res.send(result.rows);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.delete("/familias/:id", (req, res) => {
  try {
    console.log("Rota: delete/" + req.params.id);
    client.query(
      "DELETE FROM familias WHERE id = $1", [req.params.id], (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err);
        } else {
          if (result.rowCount == 0) {
            res.status(404).json({ info: "Registro não encontrado." });
          } else {
            res.status(200).json({ info: `Registro excluído. Código: ${req.params.id}` });
          }
        }
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/familias", (req, res) => {
  try {
    console.log("Alguém enviou um post com os dados:", req.body);
    const { voce, pai, mae, avo_paterno, avo_materno, ava_materno, ava_paterno } = req.body;
    client.query(
      "INSERT INTO familias (voce, pai, mae, avo_paterno, avo_materno, ava_materno, ava_paterno) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING * ", 
      [voce, pai, mae, avo_paterno, avo_materno, ava_materno, ava_paterno],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err);
        }
        const { id } = result.rows[0];
        res.setHeader("id", `${id}`);
        res.status(201).json(result.rows[0]);
        console.log(result);
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

app.put("/familias/:id", (req, res) => {
  try {
    console.log("Alguém enviou um update com os dados:", req.body);
    const id = req.params.id;
    const { voce, pai, mae, avo_paterno, avo_materno, ava_materno, ava_paterno } = req.body;
    client.query(
      "UPDATE familias SET voce=$1, pai=$2, mae=$3, avo_paterno=$4, avo_materno=$5, ava_materno=$6, ava_paterno=$7 WHERE id=$8",
      [voce, pai, mae, avo_paterno, avo_materno, ava_materno, ava_paterno, id],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de UPDATE", err);
        } else {
          res.setHeader("id", id);
          res.status(202).json({ "identificador": id });
          console.log(result);
        }
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app; 
