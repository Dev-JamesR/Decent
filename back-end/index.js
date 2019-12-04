const IPFS = require('ipfs')

let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let node;

const swarmKey = "/key/swarm/psk/1.0.0/\n/base16/\n38307a74b2176d0054ffa2864e31ee22d0fc6c3266dd856f6d41bddf14e2ad63";
var swarmKeyBuffer = new Buffer(swarmKey);


/* ===========================================================================
   Start the ethoFS node
   =========================================================================== */
function start() {
    if (!node) {
        const options = {
            libp2p: {
                modules: {
                    connProtector: new Protector(swarmKeyBuffer)
                },
		config: {
		    dht: {
		        enabled: false
		    }
		}
	    },
            config: {
	            Bootstrap: [
                        '/dns4/wss1.ethofs.com/tcp/443/wss/ipfs/QmTcwcKqKcnt84wCecShm1zdz1KagfVtqopg1xKLiwVJst',
                        '/dns4/wss.ethofs.com/tcp/443/wss/ipfs/QmPW8zExrEeno85Us3H1bk68rBo7N7WEhdpU9pC9wjQxgu',
                        '/dns4/wss2.ethofs.com/tcp/443/wss/ipfs/QmUEy4ScCYCgP6GRfVgrLDqXfLXnUUh4eKaS1fDgaCoGQJ',
                        '/dns4/wss5.ethofs.com/tcp/443/wss/ipfs/QmRwQ49Zknc2dQbywrhT8ArMDS9JdmnEyGGy4mZ1wDkgaX',
                        '/dns4/wss6.ethofs.com/tcp/443/wss/ipfs/QmaGGSUqoFpv6wuqvNKNBsxDParVuGgV3n3iPs2eVWeSN4',
                        '/dns4/wss7.ethofs.com/tcp/443/wss/ipfs/QmRYw68MzD4jPvner913mLWBdFfpPfNUx8SRFjiUCJNA4f',
                        '/dns4/wss8.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ'
                    ],
		Addresses: {
                    Swarm: [
                        '/dns4/wss1.ethofs.com/tcp/443/wss/ipfs/QmTcwcKqKcnt84wCecShm1zdz1KagfVtqopg1xKLiwVJst',
                        '/dns4/wss.ethofs.com/tcp/443/wss/ipfs/QmPW8zExrEeno85Us3H1bk68rBo7N7WEhdpU9pC9wjQxgu',
                        '/dns4/wss2.ethofs.com/tcp/443/wss/ipfs/QmUEy4ScCYCgP6GRfVgrLDqXfLXnUUh4eKaS1fDgaCoGQJ',
                        '/dns4/wss5.ethofs.com/tcp/443/wss/ipfs/QmRwQ49Zknc2dQbywrhT8ArMDS9JdmnEyGGy4mZ1wDkgaX',
                        '/dns4/wss6.ethofs.com/tcp/443/wss/ipfs/QmaGGSUqoFpv6wuqvNKNBsxDParVuGgV3n3iPs2eVWeSN4',
                        '/dns4/wss7.ethofs.com/tcp/443/wss/ipfs/QmRYw68MzD4jPvner913mLWBdFfpPfNUx8SRFjiUCJNA4f',
                        '/dns4/wss8.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ'
                     ]
                }
            }
        }
        node = new IPFS(options)
        node.once('start', () => {
            node.id()
                .then((id) => {
                    info = id
                    openSocket()
		    openSocket()
                })
                .catch((error) => onError(error))
        })
    }
}

function openSocket() {

  io.on('connection', (socket) => {
 
    socket.on('disconnect', function(){
      unSubscribeFromChannel(socket.username) ;
      io.emit('users-changed', {user: socket.username, event: 'left'});   
    });
 
    socket.on('set-name', (name) => {
      subscribeToChannel(name);
      socket.username = name;
      io.emit('users-changed', {user: name, event: 'joined'});    
    });
  
    socket.on('send-message', (message) => {
      sendMessage(socket.username, message);       
    });

    function subscribeToChannel(channelName) {
      node.pubsub.subscribe(info.id + channelName, messageHandler)
        .catch(() => onError('An error occurred when subscribing to channel.'))
    }

    function unSubscribeFromChannel(channelName) {
      node.pubsub.unsubscribe(info.id + channelName, exitMessageHandler)
        .catch(() => onError('An error occurred when unsubscribing from channel.'))
    }

    function sendMessage(channelName, message) {
      completeMessage = channelName + ":" + message;
      node.pubsub.publish(info.id + channelName, completeMessage)
        .catch(() => onError('An error occurred when publishing the message.'))
    }

    const messageHandler = (message) => {
      messageString = message.data.toString();
      splitMessage = messageString.split(":");
      io.emit('message', {msg: splitMessage[1], user: splitMessage[0], createdAt: new Date()});  
    }
  });
 
  var port = process.env.PORT || 3001;
 
  server.listen(port, function(){
     console.log('listening in http://localhost:' + port);
  });
}
