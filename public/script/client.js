(function(){
  var getNode = function(s){
    return document.querySelector(s);
  },

  //get required Nodes
  status   = getNode('.chat-status span'),
  textarea = getNode('.chat textarea'),
  chatName = getNode('.chat-name'),
  messages = getNode('.chat-messages'),

  statusDefault = status.textContent,
  setStatus = function(s){
    status.textContent = s;
    if(s!==statusDefault){
      var delay = setTimeout(function(){
        setStatus(statusDefault);
        clearInterval(delay);
      }, 1000);
    };
  };

  console.log(statusDefault);

  try {
    var socket = io();
  } catch (e) {
    //Send error in status
  }
  
  

  if(socket !== undefined) {

    //listen for a status
    socket.on('status', function(data){
      setStatus((typeof data == 'object') ? data.message: data);

      if(data.clear === true){
        textarea.value = '';
      }
    });

    //listen for keydown
    textarea.addEventListener('keydown', function(event) {
      var self = this;
      var date = new Date;
      

      if(event.which === 13 && event.shiftKey === false) {
        socket.emit('input', {
          name : chatName.value,
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
      message.textContent = "(" + data.time + ")\t"+ data.name + ": " + data.msg;

      //append message to the last
      messages.appendChild(message);
      messages.insertBefore(message, messages.firstChild);
    });
  }
})();