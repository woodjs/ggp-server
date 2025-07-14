const socketIO = require('socket.io');

exports.socketLoader = (server) => {
	const io = socketIO(server);
	io.on('connection', async (socket) => {
		socket.emit('set-conncetionId', `connectionId=${socket.id}`);
	});
	return io;
};
