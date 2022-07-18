const socket = io()

const productsBody = document.getElementById('productsBody')
const sendMessage = document.getElementById('sendMessage')
const messageInput = document.getElementById('messageInput') 
const email = document.getElementById('email') 
const messageContainer = document.getElementById('messageContainer')


const authorSchema = new normalizr.schema.Entity('authors',{},{idAttribute: 'email'} )
const msgSchema = new normalizr.schema.Entity(
  "messages",
  {authorSchema}
  )
const chatSchema  = new normalizr.schema.Entity('chat', {
 messages: [msgSchema]
})


socket.on('productos', data =>{

    const productos = data
   .map(prod => {
    const prodTemplate = `
         
         <tr>
         
         <td>${prod.title}</td>
         <td>${prod.price}</td>
         <td><img src="${prod.thumbnail}"></td>
         </tr>
    `
    return prodTemplate
    })
    .join('') 
     productsBody.innerHTML = productos
})

socket.on('join', data =>{
  const mensajes = data
  .map(men => {
    const mensTemplate = `
    <span style = "color:blue; font-weight: bold">${men.author.email}</span><span style="color:brown"> ${men.author.alias}:</span><span style ="color:green; font-style: italic"> ${men.text}</span><br>
    `
    return mensTemplate
  })
  .join('')
  messageContainer.innerHTML = mensajes
  
})

sendMessage.addEventListener('click', (e) => {
  e.preventDefault()
  const author = {
    email: data.author.email,
    nombre: data.author.nombre,
    apellido: data.author.apellido,
    edad: data.author.edad,
    alias: data.author.alias,
    avatar: data.author.avatar
  }
      const chat = {
  
        "id": "mensajes",
        mensajes: [{
          author,
        "text": data.text
        }]
      }


  socket.emit('messageInput', chat)
  messageInput.value = ''
})

socket.on('message', data => {
  
  const message = `
  <span style = "color:blue; font-weight: bold">${data.mensajes.author.email}</span><span style="color:brown"> ${data.mensajes.author.alias}:</span><span style ="color:green; font-style: italic"> ${data.text}</span><br>
  `

  messageContainer.innerHTML += message
})

socket.on('myMessage', data => {
  const message = `
  <span style = "color:blue; font-weight: bold">${data.mensajes.author.email}</span><span style="color:brown"> ${data.mensajes.author.alias}:</span><span style ="color:green; font-style: italic"> ${data.text}</span><br>
  `

  messageContainer.innerHTML += message
})