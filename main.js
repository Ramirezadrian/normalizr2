const express = require('express')
const {Server: HttpServer} =require('http')
const {Server: IOServer} = require('socket.io')
const fs = require('fs');
const faker = require('faker')
const normalizr = require('normalizr')
faker.locale = 'es'

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('views','./views')
app.set('view engine', 'ejs')
app.use(express.static('./public'))


//const { Router } = express
const Contenedor = require('./contenedor.js')
const { fstat } = require('fs')
const contenedor = new Contenedor('products.txt')
const mensajes = new Contenedor('mensajes.json')

 //***************  NORMALIZR  *****************//
const authorSchema = new normalizr.schema.Entity('authors',{},{idAttribute: 'email'} )
const msgSchema = new normalizr.schema.Entity(
  "messages",
  {authorSchema}
  )
const chatSchema  = new normalizr.schema.Entity('chat', {
  authors: [authorSchema],
 messages: [msgSchema]
})
 //***************  NORMALIZR  *****************//

//const messages = []
app.get('/products', async (req,res) =>{
  const products = await contenedor.getAll()
 
  const data ={
    products
  }
  return res.json(data)

}) 

app.get('/', async (req,res) =>{

  return res.render('form') //EJS


})




app.post('/', async (req, res) => {
  const product = {
    title: req.body.title,
    price: req.body.price,
    thumbnail: req.body.thumbnail,
  }
 
  await contenedor.save(product)

  return res.redirect('/') //EJS
 
})

const PORT = 8080

const server = httpServer.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en el puerto ${PORT}`)
})

server.on('error', error => console.log(`Error en servidor: ${error}`))


io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado')

  //const data = await contenedor.getAll()
  const productos = []

  for (let i = 0; i<5; i++){
    productos.push({title: faker.commerce.productName(), price: faker.commerce.price(), thumbnail: faker.image.image()})
  }
  const data = productos

  //***************  NORMALIZR  *****************//
  const chat = await mensajes.getAll()
  const normalizedChat = normalizr.normalize(chat, chatSchema)

  fs.promises
    .writeFile('./chatNormalized.json', JSON.stringify(normalizedChat, null, 2))
    .then(_ => console.log('ok'))



  const denormalizedChat = normalizr.denormalize(normalizedChat.result, chatSchema, normalizedChat.entities);

  fs.promises
  .writeFile('./chatDenormalized.json', JSON.stringify(denormalizedChat, null, 2))
  .then(_ => console.log('ok'))    


  const normalizedSize = JSON.stringify(normalizedChat).length
  const denormalizedSize = JSON.stringify(denormalizedChat).length
  const chatSize = JSON.stringify(chat).length

  const porcentaje = 100 - Math.round((chatSize*100)/normalizedSize)

  console.log(`Size de Chat ${chatSize}`)
  console.log(`Size de Chat normalizado ${normalizedSize}`)
  console.log(`Size de Chat denormalizado ${denormalizedSize}`)
  
  console.log(`Se ha reducido el tamaño en un ${porcentaje}%`)
 //***************  NORMALIZR  *****************//
  socket.emit('productos', data)
  
  socket.emit('join', normalizedChat)
   
  socket.on('messageInput', data => {

   

/*     const message = {
      user: data.user,
      date: `${now.getDay()}/${now.getMonth()}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
      text: data.text
    } */
const author = {
  email: data.mensajes.author.email,
  nombre: data.mensajes.author.nombre,
  apellido: data.mensajes.author.apellido,
  edad: data.mensajes.author.edad,
  alias: data.mensajes.author.alias,
  avatar: data.mensajes.author.avatar
}
    const chat = {

      "id": "mensajes",
      mensajes: [{
        author,
      "text": data.text
      }]
    }
    mensajes.save(chat)
   // messages.push(message)
    console.log(chat)
    const normalizedChat = normalizr.normalize(mensajes, chatSchema)

  fs.promises
    .writeFile('./chatNormalized.json', JSON.stringify(normalizedChat, null, 2))
    .then(_ => console.log('ok'))
   socket.emit('myMessage', chat)
    
    socket.broadcast.emit('message', chat)
  })

})



 

