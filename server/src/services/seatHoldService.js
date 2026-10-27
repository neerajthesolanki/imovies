import Show from '../models/Show.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

let ioInstance = null;

export const setSeatSocketServer = (io) => {
  ioInstance = io;
};

export const getSeatSocketServer = () => ioInstance;

const HOLD_DURATION_MS = (parseInt(process.env.SEAT_HOLD_DURATION_MINUTES, 10) || 8) * 60 * 1000;

// Periodic cleanup of expired temporary holds
setInterval(async () => {
  const now = new Date();

  // Clean memory holds
  for (const [key, hold] of memoryStore.temporaryHolds.entries()) {
    if (new Date(hold.expiresAt) <= now) {
      memoryStore.temporaryHolds.delete(key);
      const [showId, seatId] = key.split('_');
      if (ioInstance) {
        ioInstance.to(`show_${showId}`).emit('seat_released', {
          showId,
          seats: [seatId],
          reason: 'hold_expired'
        });
      }
    }
  }

  // Clean DB holds if connected
  if (dbState.isConnected) {
    try {
      const showsWithExpiredHolds = await Show.find({
        'temporaryHolds.expiresAt': { $lte: now }
      });

      for (const show of showsWithExpiredHolds) {
        const expiredSeats = show.temporaryHolds
          .filter(h => h.expiresAt <= now)
          .map(h => h.seatId);

        show.temporaryHolds = show.temporaryHolds.filter(h => h.expiresAt > now);
        await show.save();

        if (ioInstance && expiredSeats.length > 0) {
          ioInstance.to(`show_${show._id}`).emit('seat_released', {
            showId: show._id,
            seats: expiredSeats,
            reason: 'hold_expired'
          });
        }
      }
    } catch (err) {
      // ignore periodic timer check error
    }
  }
}, 15000); // Check every 15 seconds

export const holdSeats = async (showId, seatIds, userId) => {
  const expiresAt = new Date(Date.now() + HOLD_DURATION_MS);
  const holdToken = 'hold_' + Math.random().toString(36).substring(2, 12);

  if (dbState.isConnected) {
    const show = await Show.findById(showId);
    if (!show) {
      throw new Error('Show not found');
    }

    // Check already booked
    const alreadyBooked = seatIds.filter(seat => show.bookedSeats.includes(seat));
    if (alreadyBooked.length > 0) {
      throw new Error(`Seats already booked: ${alreadyBooked.join(', ')}`);
    }

    // Check actively held by other users
    const now = new Date();
    const activeHolds = show.temporaryHolds.filter(h => h.expiresAt > now);
    const conflictingHold = activeHolds.find(
      h => seatIds.includes(h.seatId) && h.userId?.toString() !== userId.toString()
    );

    if (conflictingHold) {
      throw new Error(`Seat ${conflictingHold.seatId} is temporarily held by another guest.`);
    }

    // Filter out our own previous holds for these seats
    show.temporaryHolds = activeHolds.filter(h => !seatIds.includes(h.seatId));

    // Add new holds
    for (const seatId of seatIds) {
      show.temporaryHolds.push({
        seatId,
        userId,
        holdToken,
        expiresAt
      });
    }

    await show.save();
  } else {
    // Memory store fallback
    const show = memoryStore.shows.find(s => s._id.toString() === showId.toString());
    if (!show) {
      throw new Error('Show not found');
    }

    const alreadyBooked = seatIds.filter(seat => (show.bookedSeats || []).includes(seat));
    if (alreadyBooked.length > 0) {
      throw new Error(`Seats already booked: ${alreadyBooked.join(', ')}`);
    }

    const now = new Date();
    for (const seatId of seatIds) {
      const key = `${showId}_${seatId}`;
      const existingHold = memoryStore.temporaryHolds.get(key);
      if (existingHold && new Date(existingHold.expiresAt) > now && existingHold.userId !== userId.toString()) {
        throw new Error(`Seat ${seatId} is temporarily held by another guest.`);
      }
    }

    for (const seatId of seatIds) {
      const key = `${showId}_${seatId}`;
      memoryStore.temporaryHolds.set(key, {
        userId: userId.toString(),
        holdToken,
        expiresAt
      });
    }
  }

  // Broadcast to room
  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seats_held', {
      showId,
      seats: seatIds,
      heldBy: userId,
      expiresAt
    });
  }

  return {
    holdToken,
    expiresAt,
    seats: seatIds
  };
};

export const releaseHeldSeats = async (showId, seatIds, userId = null) => {
  if (dbState.isConnected) {
    const show = await Show.findById(showId);
    if (show) {
      show.temporaryHolds = show.temporaryHolds.filter(
        h => !seatIds.includes(h.seatId) || (userId && h.userId?.toString() !== userId.toString())
      );
      await show.save();
    }
  } else {
    for (const seatId of seatIds) {
      const key = `${showId}_${seatId}`;
      memoryStore.temporaryHolds.delete(key);
    }
  }

  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seat_released', {
      showId,
      seats: seatIds,
      reason: 'manual_release'
    });
  }
};
