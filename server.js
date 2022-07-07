const express = require("express");
const app = express();
const http = require("http");
const schedule = require("node-schedule");
const { Server } = require("socket.io");

const ACTIONS = {
	JOIN: "JOIN",
	LEAVE: "LEAVE",
	SYNC: "SYNC",
	FULL: "FULL",
	QUERY: "QUERY"
};

const MAX_PARTICIPANTS = 10;
const rooms = {};
const maps = {};
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["*"]
	}
});

io.on("connection", socket => {
	socket.on(ACTIONS.JOIN, ({ projectId, user }) => {
		if (rooms[projectId] && rooms[projectId].length === MAX_PARTICIPANTS) {
			return socket.emit(ACTIONS.FULL);
		}

		socket.join(projectId);
		maps[socket.id] = projectId;

		if (!rooms[projectId]) {
			rooms[projectId] = [{ ...user, id: socket.id }];
		} else {
			if (!rooms[projectId].find(m => m.uid === user.uid))
				rooms[projectId].push({ ...user, id: socket.id });
		}
		io.to(projectId).emit(ACTIONS.JOIN, { m: rooms[projectId], n: user });
		io.to(projectId).emit(ACTIONS.QUERY, { participants: rooms[projectId] });
		console.log("[JOIN]", rooms[projectId]);
	});

	// sync cursor positions
	socket.on(ACTIONS.SYNC, ({ projectId, uid, pos, doc }) => {
		const target = rooms[projectId].findIndex(member => member.uid === uid);
		if (target >= 0) {
			rooms[projectId][target].pos = pos;

			io.to(projectId).emit(ACTIONS.SYNC, { m: rooms[projectId], doc });
			console.log("[SYNC]", rooms[projectId]);
		}
	});

	socket.on(ACTIONS.LEAVE, ({ projectId, uid }) => {
		const target = rooms[projectId].findIndex(member => member.uid === uid);
		rooms[projectId].splice(target, 1);
		io.to(projectId).emit(ACTIONS.SYNC, { m: rooms[projectId] });
		io.to(projectId).emit(ACTIONS.QUERY, {
			participants: rooms[projectId]
		});
		socket.leave(projectId);
		console.log("[LEAVE]", rooms[projectId]);
	});

	socket.on(ACTIONS.QUERY, ({ projectId }) => {
		socket.emit(ACTIONS.QUERY, {
			participants: rooms[projectId]
		});
	});

	socket.on("disconnect", () => {
		const projectId = maps[socket.id];
		if (projectId) {
			const target = rooms[projectId].findIndex(
				member => member.id === socket.id
			);
			if (target >= 0) rooms[projectId].splice(target, 1);
			delete maps[socket.id];
			io.to(projectId).emit(ACTIONS.QUERY, {
				participants: rooms[projectId]
			});
			console.log(maps);
			console.log("[DISCONNECTED]", socket.id);
		}
	});
});

const job = schedule.scheduleJob("30 2 * * *", () => {
	Object.keys(rooms).forEach(k => {
		if (!rooms[k].length) delete rooms[k];
	});
});

server.listen(process.env.PORT || 3001, () => {
	console.log("listening on port 3001");
});
