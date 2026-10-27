import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import { holdSeats, releaseHeldSeats, getSeatSocketServer } from '../services/seatHoldService.js';
import { processPayment } from '../services/paymentService.js';
import { generateTicketQR } from '../utils/ticketGenerator.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

export const holdSelectedSeats = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return sendError(res, 400, 'Please select at least one seat to reserve.');
    }

    const holdData = await holdSeats(showId, seats, req.user._id);
    return sendResponse(res, 200, true, 'Seats held temporarily.', holdData);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const releaseSeats = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    if (showId && seats) {
      await releaseHeldSeats(showId, seats, req.user._id);
    }
    return sendResponse(res, 200, true, 'Seats released.');
  } catch (error) {
    next(error);
  }
};

export const createBookingAndPay = async (req, res, next) => {
  try {
    const {
      showId,
      seats, // array of { seatId, row, number, category, price }
      paymentMethod,
      simulateFailure = false
    } = req.body;

    if (!showId || !seats || seats.length === 0) {
      return sendError(res, 400, 'Invalid booking request: missing show or seats.');
    }

    const seatIds = seats.map(s => s.seatId);
    const subtotal = seats.reduce((sum, s) => sum + (Number(s.price) || 200), 0);
    const convenienceFee = Math.round(subtotal * 0.08); // 8% fee
    const taxAmount = Math.round((subtotal + convenienceFee) * 0.05); // 5% GST
    const totalAmount = subtotal + convenienceFee + taxAmount;

    let show, movie, theatre;

    if (dbState.isConnected) {
      show = await Show.findById(showId).populate('movie').populate('theatre').populate('screen');
      if (!show) return sendError(res, 404, 'Showtime not found.');

      // Check if already booked
      const conflict = seatIds.some(s => show.bookedSeats.includes(s));
      if (conflict) {
        return sendError(res, 409, 'One or more of the selected seats were already confirmed by another customer.');
      }

      movie = show.movie;
      theatre = show.theatre;
    } else {
      show = memoryStore.shows.find(s => s._id.toString() === showId.toString());
      if (!show) return sendError(res, 404, 'Showtime not found.');

      const conflict = seatIds.some(s => (show.bookedSeats || []).includes(s));
      if (conflict) {
        return sendError(res, 409, 'One or more of the selected seats were already confirmed by another customer.');
      }

      movie = memoryStore.movies.find(m => m._id.toString() === (show.movie?._id || show.movie).toString());
      theatre = memoryStore.theatres.find(t => t._id.toString() === (show.theatre?._id || show.theatre).toString());
    }

    // Process payment
    const bookingRef = 'IMV-' + Math.floor(100000 + Math.random() * 900000);
    const paymentResult = await processPayment({
      amount: totalAmount,
      currency: 'INR',
      paymentMethod,
      bookingReference: bookingRef,
      simulateFailure
    });

    if (!paymentResult.success) {
      // Release holds on failure
      await releaseHeldSeats(showId, seatIds, req.user._id);
      return sendError(res, 402, paymentResult.message || 'Payment processing failed.');
    }

    // Generate QR code
    const qrCodeUrl = await generateTicketQR({
      bookingReference: bookingRef,
      movieTitle: movie?.title || 'IMovies Feature',
      seats: seatIds.join(', '),
      showTime: show.startTime,
      showDate: new Date(show.showDate).toLocaleDateString(),
      theatreName: theatre?.name || 'IMovies Cinema',
      screenName: show.screen?.name || 'Screen 1'
    });

    if (dbState.isConnected) {
      // Create Booking in DB
      const booking = await Booking.create({
        bookingReference: bookingRef,
        user: req.user._id,
        show: show._id,
        movie: movie._id,
        theatre: theatre._id,
        screenName: show.screen?.name || 'Screen 1',
        seats,
        showDate: show.showDate,
        showTime: show.startTime,
        pricingSummary: {
          subtotal,
          convenienceFee,
          taxAmount,
          totalAmount
        },
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        qrCodeUrl
      });

      // Create Payment Record
      const payment = await Payment.create({
        booking: booking._id,
        user: req.user._id,
        transactionId: paymentResult.transactionId,
        orderId: paymentResult.orderId,
        amount: totalAmount,
        currency: 'INR',
        paymentGateway: paymentResult.gateway,
        paymentMethod: paymentResult.paymentMethod,
        status: 'success',
        paidAt: paymentResult.paidAt
      });

      booking.paymentId = payment._id;
      await booking.save();

      // Add to show booked seats and clear temporary holds
      show.bookedSeats.push(...seatIds);
      show.temporaryHolds = show.temporaryHolds.filter(h => !seatIds.includes(h.seatId));
      await show.save();

      // Create Notification
      await Notification.create({
        user: req.user._id,
        title: 'Booking Confirmed!',
        message: `Your booking for "${movie?.title}" (${seatIds.join(', ')}) at ${theatre?.name} is confirmed! Reference: ${bookingRef}`,
        type: 'booking_confirmed'
      });

      // Socket broadcast
      const io = getSeatSocketServer();
      if (io) {
        io.to(`show_${show._id}`).emit('seats_booked', {
          showId: show._id,
          seats: seatIds
        });
      }

      return sendResponse(res, 201, true, 'Booking confirmed successfully!', {
        booking,
        payment
      });
    } else {
      // Memory Store Fallback
      const newBooking = {
        _id: 'bkg_' + Date.now().toString(36),
        bookingReference: bookingRef,
        user: req.user._id,
        show: show._id,
        movie: movie || show.movie,
        theatre: theatre || show.theatre,
        screenName: 'Screen 1',
        seats,
        showDate: show.showDate,
        showTime: show.startTime,
        pricingSummary: {
          subtotal,
          convenienceFee,
          taxAmount,
          totalAmount
        },
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        qrCodeUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newPayment = {
        _id: 'pay_' + Date.now().toString(36),
        booking: newBooking._id,
        user: req.user._id,
        transactionId: paymentResult.transactionId,
        orderId: paymentResult.orderId,
        amount: totalAmount,
        currency: 'INR',
        paymentGateway: paymentResult.gateway,
        paymentMethod: paymentResult.paymentMethod,
        status: 'success',
        paidAt: paymentResult.paidAt,
        createdAt: new Date()
      };

      memoryStore.bookings.unshift(newBooking);
      memoryStore.payments.push(newPayment);

      if (!show.bookedSeats) show.bookedSeats = [];
      show.bookedSeats.push(...seatIds);

      // Clean memory holds
      for (const seatId of seatIds) {
        memoryStore.temporaryHolds.delete(`${showId}_${seatId}`);
      }

      // Notification
      memoryStore.notifications.unshift({
        _id: 'notif_' + Date.now().toString(36),
        user: req.user._id,
        title: 'Booking Confirmed!',
        message: `Your booking for "${movie?.title}" (${seatIds.join(', ')}) is confirmed! Ref: ${bookingRef}`,
        type: 'booking_confirmed',
        read: false,
        createdAt: new Date()
      });

      const io = getSeatSocketServer();
      if (io) {
        io.to(`show_${showId}`).emit('seats_booked', {
          showId,
          seats: seatIds
        });
      }

      return sendResponse(res, 201, true, 'Booking confirmed successfully!', {
        booking: newBooking,
        payment: newPayment
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    if (dbState.isConnected) {
      const bookings = await Booking.find({ user: req.user._id })
        .populate('movie', 'title posterUrl duration language certificate')
        .populate('theatre', 'name city address')
        .sort({ createdAt: -1 });

      return sendResponse(res, 200, true, 'User booking history retrieved.', bookings);
    } else {
      const bookings = memoryStore.bookings
        .filter(b => b.user?.toString() === req.user._id.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return sendResponse(res, 200, true, 'User booking history retrieved.', bookings);
    }
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbState.isConnected) {
      const booking = await Booking.findById(id)
        .populate('movie')
        .populate('theatre')
        .populate('show')
        .populate('paymentId');

      if (!booking) return sendError(res, 404, 'Booking not found.');

      if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Unauthorized access to this booking.');
      }

      return sendResponse(res, 200, true, 'Booking details retrieved.', booking);
    } else {
      const booking = memoryStore.bookings.find(
        b => b._id.toString() === id.toString() || b.bookingReference === id
      );

      if (!booking) return sendError(res, 404, 'Booking not found.');

      if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Unauthorized access to this booking.');
      }

      return sendResponse(res, 200, true, 'Booking details retrieved.', booking);
    }
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (dbState.isConnected) {
      const booking = await Booking.findById(id);
      if (!booking) return sendError(res, 404, 'Booking not found.');

      if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Not authorized to cancel this booking.');
      }

      if (booking.bookingStatus === 'cancelled') {
        return sendError(res, 400, 'This booking has already been cancelled.');
      }

      // Check cancellation eligibility (e.g. at least 2 hours before show)
      const show = await Show.findById(booking.show);
      const showDateTime = new Date(booking.showDate);
      const hoursUntilShow = (showDateTime - new Date()) / (1000 * 60 * 60);

      const refundAmount = Math.round(booking.pricingSummary.totalAmount * 0.85); // 85% refund policy

      booking.bookingStatus = 'cancelled';
      booking.paymentStatus = 'refunded';
      booking.cancellation = {
        isCancelled: true,
        cancelledAt: new Date(),
        refundAmount,
        reason: reason || 'Customer requested cancellation.'
      };

      await booking.save();

      // Release booked seats from the show
      if (show) {
        const releasedSeatIds = booking.seats.map(s => s.seatId);
        show.bookedSeats = show.bookedSeats.filter(s => !releasedSeatIds.includes(s));
        await show.save();

        const io = getSeatSocketServer();
        if (io) {
          io.to(`show_${show._id}`).emit('seat_released', {
            showId: show._id,
            seats: releasedSeatIds,
            reason: 'booking_cancelled'
          });
        }
      }

      return sendResponse(res, 200, true, 'Booking cancelled successfully. Refund initiated.', {
        booking,
        refundAmount
      });
    } else {
      const booking = memoryStore.bookings.find(b => b._id.toString() === id.toString());
      if (!booking) return sendError(res, 404, 'Booking not found.');

      if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Not authorized to cancel this booking.');
      }

      if (booking.bookingStatus === 'cancelled') {
        return sendError(res, 400, 'This booking has already been cancelled.');
      }

      const refundAmount = Math.round(booking.pricingSummary.totalAmount * 0.85);

      booking.bookingStatus = 'cancelled';
      booking.paymentStatus = 'refunded';
      booking.cancellation = {
        isCancelled: true,
        cancelledAt: new Date(),
        refundAmount,
        reason: reason || 'Customer requested cancellation.'
      };

      const show = memoryStore.shows.find(s => s._id.toString() === (booking.show?._id || booking.show).toString());
      if (show && show.bookedSeats) {
        const releasedSeatIds = booking.seats.map(s => s.seatId);
        show.bookedSeats = show.bookedSeats.filter(s => !releasedSeatIds.includes(s));

        const io = getSeatSocketServer();
        if (io) {
          io.to(`show_${show._id}`).emit('seat_released', {
            showId: show._id,
            seats: releasedSeatIds,
            reason: 'booking_cancelled'
          });
        }
      }

      return sendResponse(res, 200, true, 'Booking cancelled successfully. Refund initiated.', {
        booking,
        refundAmount
      });
    }
  } catch (error) {
    next(error);
  }
};
