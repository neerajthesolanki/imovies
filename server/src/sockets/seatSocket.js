import { setSeatSocketServer, holdSeats, releaseHeldSeats } from '../services/seatHoldService.js';

export const setupSeatSocket = (io) => {
  setSeatSocketServer(io);

  io.on('connection', (socket) => {
    socket.on('join_show', (showId) => {
      if (showId) {
        socket.join(`show_${showId}`);
      }
    });

    socket.on('leave_show', (showId) => {
      if (showId) {
        socket.leave(`show_${showId}`);
      }
    });

    socket.on('hold_seats_request', async ({ showId, seats, userId }) => {
      try {
        const holdResult = await holdSeats(showId, seats, userId);
        socket.emit('hold_seats_success', holdResult);
      } catch (error) {
        socket.emit('hold_seats_error', { message: error.message });
      }
    });

    socket.on('release_seats_request', async ({ showId, seats, userId }) => {
      try {
        await releaseHeldSeats(showId, seats, userId);
        socket.emit('release_seats_success', { seats });
      } catch (error) {
        socket.emit('release_seats_error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });
};
