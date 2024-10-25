const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const post = require("./models/post")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore')
const serviceAccount = require('./projetowebii-96767-firebase-adminsdk-rv7el-9998a62ef4.json');

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({
    defaultLayout: "main",
    helpers: {
        eq: function (a, b) {
            return a === b;
        }
    }
}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post("/cadastrar", function (req, res) {
    var result = db.collection('clientes').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function () {
        console.log("Dados cadastrados com sucesso!")
        res.redirect("/consultar")
    })
})

app.get("/", function (req, res) {
    res.render("primeira_pagina")
})

app.get("/consultar", function (req, res) {
    var posts = []
    db.collection('clientes').get().then(
        function (snapshot) {
            snapshot.forEach(function (doc) {
                const data = doc.data()
                data.id = doc.id
                posts.push(data)
            })
            res.render("segunda_pagina", { posts: posts })
        })
})

app.get("/editar/:id", function(req, res) {
    const id = req.params.id;
    var posts = [];
    
    db.collection('clientes').doc(id).get().then(function(doc) {
        if (doc.exists) {
            const data = doc.data();
            data.id = doc.id;
            posts.push(data);
            res.render("terceira_pagina", { posts: posts });
        } else {
            res.send("Documento não encontrado!");
        }
    }).catch((error) => {
        console.error("Erro ao buscar o documento: ", error);
        res.send("Erro ao buscar o documento.");
    });
});

app.post("/atualizar/:id", function (req, res) {
    const id = req.params.id;
    const updatedData = {
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    };

    db.collection('clientes').doc(id).update(updatedData).then(() => {
        console.log("Documento atualizado com sucesso!");
        res.redirect("/consultar");
    }).catch((error) => {
        res.send("Erro ao atualizar o documento.");
    });
});

app.post("/excluir", function (req, res) {
    const id = req.body.id;
    db.collection('clientes').doc(id).delete().then(() => {
        console.log("Documento excluído com sucesso!");
        res.redirect("/consultar");
    }).catch((error) => {
        res.send("Erro ao excluir o documento.");
    });
});

app.listen(8081, function () {
    console.log("Servidor funfando no link http://localhost:8081")
})