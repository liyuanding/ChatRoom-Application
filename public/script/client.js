
//get required Nodes
var getNode = function(s){
  return document.querySelector(s);
},


//status   = getNode('.chat-status span');
textarea = getNode('.chat textarea');
messages = getNode('.chat-messages');

/*
statusDefault = status.textContent;
console.log('status.textContent:' + statusDefault);

setStatus = function(s){
  console.log(s);
  status.textContent = s;
  if(s!==statusDefault){
    var delay = setTimeout(function(){
      setStatus(statusDefault);
      clearInterval(delay);
    }, 5000);
  };
};

setStatus('Testing');
console.log(statusDefault);
*/


//connect to socket
try {
  var socket = io();
} catch (e) {
  //Send error in status
}
  
  

if(socket !== undefined) {


  //get new client's name through prompt window
  var gotName = false;

  while (gotName == false){
    var chatName = prompt( "Hello! What's your name?" );
    if(chatName!==null && chatName!==""){
      //send request to server to check if the client already talked in chatty room
      //socket.emit('chatName', {name : chatName});
      gotName = true;

      //socket.on('existName', function(data){
      //  if(data == true)
      //    alert( "Welcome back, " + chatName + "!" );
      //  else
      //    alert( "Welcome new client, " + chatName + "!" );
      //});
    }
  }

  //listen for a status
  socket.on('status', function(data){
    //setStatus((typeof data == 'object') ? data.message: data);
    console.log("Debug");
    if(data.clear === true){
      textarea.value = '';
    }
  });

  //listen for client's pressing key
  textarea.addEventListener('keydown', function(event) {
    var self = this;
    var date = new Date;
      

    if(event.which === 13 && event.shiftKey === false) {
      console.log('chatName is ' + chatName);
      console.log('test text is' + textarea.value);
      socket.emit('input', {
        name : chatName,
        msg : self.value,
        time : date.toLocaleTimeString()
      });

      event.preventDefault();
    }
  });


  //listen for mssages
  socket.on('output', function(data){
    console.log(data);
    var message = document.createElement('div');
    message.setAttribute('class','chat-message');
    //if(data.leave == true && data.enter == false){
    //  message.textContent = "A user has left the chatty room."
    //}
    //else if (data.enter == true && data.leave == false){
    //  message.textContent = "A user has entered the chatty room."
    //}else {
      message.textContent = "(" + data.time + ")\t"+ data.name + ": " + data.msg;
    //}


    //append message to the last
    messages.appendChild(message);
    messages.insertBefore(message, null);
  });
}

function sendButton(){
  console.log('test');
  console.log('test chatName is ' + chatName);
  console.log('test text is' + textarea.value);
  var date = new Date;
  socket.emit('input', {
        name : chatName,
        msg : textarea.value,
        time : date.toLocaleTimeString()
      });
}