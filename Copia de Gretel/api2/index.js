const express = require("express");
const db = require("./config/db");
const cors = require("cors");

const app = express();
const PORT = 8891;

app.use(cors());
app.use(express.json());

// Route to get all posts
app.get("/api/get", (req, res) => {
  db.query("SELECT * FROM Users", (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log(result);
    res.send(result);
  });
});



// Metodo para login
app.post("/api/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  
  console.log('EMAIL: ' + email)
  console.log('PASS: ' + password)
  db.query("SELECT * FROM Users WHERE Email = ?" , [email],(err, result) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      })
    }
    console.log("Resultado",result)
    console.log('ERROR',err)
    console.log('LONGITUD',result.length)
   
    // Condición si result viene vacio.
    if(!result.length){                   
      console.log('ENTRE AL IF DE LISTA []')
      return res.status(200).json({
        ok: false,
        err: {
          message: "Usuario o Contraseña Incorrectos."
        }
      })
    }
    console.log(result)
    if(result[0]['Password'] != password){
      console.log('Entre al if de contraseña.')
      return res.status(200).json({
        ok: false,
        err: {
          message: "Usuario o Contraseña Incorrectos."
        }
      })
    }
    console.log('ESTE ES RESULT',result)
    const id = result[0]['id']
    console.log('ESTE ES EL ID',id)
    res.json({
      ok: true,
      id: id,
      user: email
    });

    // console.log(result);
  });
});


//Método para obtener usuario por ID

app.post('/api/userid',(req,res) => {
  const id = req.body.id
  console.log('ESTE ES EL ID EN USER API',id)
  db.query("SELECT * FROM Users WHERE id = ? " , [id], (err,result)=>{
     if(err) { 
         console.log(err)
     } 
     if(!result.length){
      return res.status(400).json({
        ok: false,
        err: {
          message: "El usuario no existe"
        }
      });
     }

     const nombre = result[0]['Nombre']
     const isAdmin = result[0]['Admin']

     console.log('ESTE ES RESULT EN USER API', result)
     console.log('ESTE ES NOMBRE EN USER API', nombre)
     console.log('ESTE ES ISADMIN EN USER API', isAdmin)


     return res.status(200).json({
      ok: true,
      name: nombre,
      isAdmin: isAdmin
    })
   });
});   



//Metodo agregar usuarios


app.post('/create', (req,res)=> {

  console.log("Hola antes")
  const name = req.body.name
  const lastname = req.body.lastName
  const email = req.body.email
  const password = req.body.password
  const isAdmin = req.body.isAdmin
  console.log("Hola, estoy aqui",name,lastname,email,password,isAdmin)
  
  db.query("INSERT INTO Users (Nombre, Apellido, Email, Password, Admin) VALUES (?,?,?,?,?)",[name,lastname,email,password,isAdmin], (err,result)=>{
     if(err) { 
         console.log(err)
     } 
     console.log(result)
  }
  );   
  })

// app.post("/login", (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;
// });


//SQL para tarjetas

// Método para leer las tarjetas.

app.get("/api/getCard", (req, res) => {
  db.query("SELECT * FROM tarjeta", (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log(result);
    res.send(result);
  });
});

// Método para leer la info del blog.

app.post("/id/getCard", (req, res) => {
  const id = req.body.id;
  console.log('Estoy en ID/GETCARD este es el ID: ',id)
  db.query("SELECT * FROM tarjeta WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }

    console.log('ESTOY EN ID/GETCARD, ESTO ES LO QUE ENCONTRE',result)
    return res.status(200).json({
      ok: true,
      titulo: result[0]['titulo'],
      informacion: result[0]['informacion'],
      imgURL: result[0]['image'],
      fecha: result[0]['fecha'],
      fuente: result[0]['fuente']
    })
  });
});

// Método para leer toda info de card.
app.get("/api/getCard2", (req, res) => {
  console.log('Estoy en API/GETCARD2')
  db.query("SELECT * FROM card ", (err, result) => {
    if (err) {
      console.log(err);
    }

    console.log('ESTOY EN API/GETCARD2, ESTO ES LO QUE ENCONTRE',result)
    res.send(result)
  });
});



// Método para leer la info de card.
app.post("/id/getCard2", (req, res) => {
  const id = req.body.id;
  console.log('Estoy en ID/GETCARD2 este es el ID: ',id)
  db.query("SELECT * FROM card WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }

    console.log('ESTOY EN ID/GETCARD2, ESTO ES LO QUE ENCONTRE',result)
    return res.status(200).json({
      ok: true,
      titulo: result[0]['titulo'],
      informacion: result[0]['info'],
      imgURL: result[0]['image']
    })
  });
});


// Método para leer la info de survey.
app.post("/id/getSurvey", (req, res) => {
  const id = req.body.id;
  console.log('Estoy en ID/GETSURVEY este es el ID: ',id)
  db.query("SELECT * FROM encuestas WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }

    console.log('ESTOY EN ID/GETSURVEY, ESTO ES LO QUE ENCONTRE',result)
    return res.status(200).json({
      ok: true,
      titulo: result[0]['titulo'],
      desc: result[0]['descripcion'],
      link: result[0]['link']
    })
  });
});



// Método para Insertar tarjeta
app.get("/createCard", (req, res) => {
    
    // TITULO, INFORMACION, IMAGE, FECHA, FUENTE
    const title = req.body.titulo
    const img_url = req.body.image
    const date = req.body.fecha
    const desc = req.body.informacion
    const source_info = req.body.fuente
    
    db.query("INSERT INTO tarjeta (titulo, informacion, image, fecha, fuente) VALUES (?,?,?,?,?)",[title,desc,img_url,date,source_info], (err,result)=>{
      if(err) {
          console.log(err)
      } 
      console.log(result)
    }
    );   
  })

// Método para actualizar blog
app.post("/updateBlog", (req, res) => {
    
  // TITULO, INFORMACION, IMAGE, FECHA, FUENTE
  const id = req.body.id
  const title = req.body.titulo
  const img_url = req.body.imageURL
  const date = req.body.fecha
  const desc = req.body.informacion
  const source_info = req.body.fuente
  console.log('IMAGE IN BACK',img_url)

  db.query("UPDATE tarjeta SET titulo=?, informacion=?, image=?, fecha=?, fuente=? WHERE id = ? ",[title,desc,img_url,date,source_info,id], (err,result)=>{
    if(err) {
        console.log(err)
    } 
    console.log(result)
    return res.status(200).json({
      ok: true
    })
  }
  );   
})

// Método para actualizar tarjeta
app.post("/updateCard", (req, res) => {
    
  // TITULO, INFORMACION, IMAGE, FECHA, FUENTE
  const id = req.body.id
  const title = req.body.titulo
  const desc = req.body.informacion
  const img_url = req.body.imageURL

  
  db.query("UPDATE card SET titulo=?, info=?, image=? WHERE id = ? ",[title,desc,img_url,id], (err,result)=>{
    if(err) {
        console.log(err)
    } 
    
    return res.status(200).json({
      ok: true
    })
  }
  );   
})

app.get("/updateHeadersBlog",(req,res) => {

  db.query("SELECT id,titulo FROM tarjeta", (err, result)=>{

    if (err){
      console.log('Internal Server Error in select query to updateHeadersCard')
    }

    console.log('ESTE ES RESULT EN UPDATE HEADERS BLOG',result)

    return res.status(200).json({
      ok: true,
      titles: result
    })

  });



})


app.get("/updateHeadersCard",(req,res) => {

  db.query("SELECT id,titulo FROM card", (err, result)=>{

    if (err){
      console.log('Internal Server Error in select query to updateHeadersCard')
    }

    console.log('ESTE ES RESULT EN UPDATE HEADERS CARD',result)

    return res.status(200).json({
      ok: true,
      titles: result
    })

  });



})


// Eliminar nota en blog

app.post("/id/deleteFromBlog", (req, res) => {
  const id = req.body.id;
  console.log('Estoy en ID/DeleteFromBlog este es el ID: ',id)
  db.query("DELETE FROM tarjeta WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }

    console.log('ESTOY EN ID/DeleteFromBlog, ESTO ES LO QUE ENCONTRE',result)
    return res.status(200).json({
      ok: true,
    })
  });
});


// Eliminar nota en Card

app.post("/id/deleteFromCard", (req, res) => {
  const id = req.body.id;
  console.log('Estoy en ID/DeleteFromCard este es el ID: ',id)
  db.query("DELETE FROM card WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }

    console.log('ESTOY EN ID/DeleteFromBlog, ESTO ES LO QUE ENCONTRE',result)
    return res.status(200).json({
      ok: true,
    })
  });
});


// Insertar datos en la base de datos

app.post("/insertBlog", (req, res) => {
  const title = req.body.titulo
  const img_url = req.body.imageURL
  const date = req.body.fecha
  const desc = req.body.informacion
  const source_info = req.body.fuente

  console.log('Estoy en INSERT TARJETA')
  db.query("INSERT INTO tarjeta (titulo, informacion, image, fecha, fuente) VALUES (?,?,?,?,?) ", [title,desc,img_url,date,source_info], (err, result) => {
    if (err) {
      console.log(err);
    }
    return res.status(200).json({
      ok: true,
    })
  });
});


app.post("/insertCard", (req, res) => {
  const title = req.body.titulo
  const img_url = req.body.imageURL
  const desc = req.body.informacion

  console.log('Estoy en INSERT CARD')
  db.query("INSERT INTO card (titulo, info, image) VALUES (?,?,?) ", [title,desc,img_url], (err, result) => {
    if (err) {
      console.log(err);
    }

    return res.status(200).json({
      ok: true,
    })
  });
});


app.post("/insertSU", (req, res) => {
  const name = req.body.name
  const lname = req.body.lname
  const user = req.body.user
  const pwd = req.body.pwd
  const isAdmin = 'True'

  console.log(name,lname,user)

  db.query("INSERT INTO Users (Nombre, Apellido, Email, Password, Admin ) VALUES (?,?,?,?,?) ", [name,lname,user,pwd,isAdmin], (err, result) => {
    if (err) {
      console.log(err);
    }

    return res.status(200).json({ 
      ok: true,
      msg: 'Se ha añadido el usuario correctamente.'
    }) 
  });
});



//Method to get ALL USERS IN THE DB

app.get('/getUsersLength', (req, res) =>{

  db.query('SELECT Nombre FROM Users',(err, result) => {
    if (err){
      console.log('Internal Server Error in select query to getUsersLength')
    }

    console.log('ESTE ES RESULT EN GET USERS LENGTH',result)

    return res.status(200).json({
      ok: true,
      lengthUsers: result.length
    })
  })
});



//Method to get ALL SURVEYS IN THE DB

app.get('/getAllSurveys', (req, res) =>{

  db.query('SELECT * FROM encuestas',(err, result) => {
    if (err){
      console.log('Internal Server Error in select query to getUsersLength')
    }

    console.log('ESTE ES RESULT EN GET SURVEYS LENGTH',result)

    return res.status(200).json({
      ok: true,
      surveys: result
    })
  })
});



//Method to get INSERT A NEW SURVEY

app.post('/insertNewSurvey', (req, res) =>{

  const titulo = req.body.title
  const desc = req.body.desc
  const link = req.body.url
  db.query('INSERT INTO encuestas (titulo, link, descripcion)  VALUES (?,?,?) ', [titulo,link,desc],(err, result)  => {
    if (err){
      console.log('Internal Server Error in select query to getUsersLength')
    }

    console.log('Se han insertado los datos de ', titulo)

    return res.status(200).json({
      ok: true,
    })
  })
});


//Method to delete a SURVEY IN THE DB

app.post('/id/deleteFromSurvey', (req, res) =>{
  id = req.body.id
  db.query('DELETE FROM encuestas WHERE id = ?',[id],(err, result) => {
    if (err){
      console.log('Internal Server Error in DELETE SURVEY')
    }
    return res.status(200).json({
      ok: true,
    })
  })
});


// Método para actualizar survey
app.post("/id/updateSurvey", (req, res) => {
    
  // TITULO, INFORMACION, IMAGE, FECHA, FUENTE
  const id = req.body.id
  const title = req.body.title
  const desc = req.body.desc
  const link = req.body.url

  
  db.query("UPDATE encuestas SET titulo=?, link=?, descripcion=? WHERE id = ? ",[title,link,desc,id], (err,result)=>{
    if(err) {
        console.log(err)
    } 
    console.log('ACTUALIZADO EL TITULO DE ENCUESTA:',title)
    return res.status(200).json({
      ok: true
    })
  }
  );   
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})
