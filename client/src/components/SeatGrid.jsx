import React from 'react';

const SeatGrid = ({
  seatingLayout = [],
  pricing = {},
  bookedSeats = [],
  heldSeats = [],
  selectedSeats = [],
  onSeatClick
}) => {
  const getSeatStatus = (seatId) => {
    if (selectedSeats.some(s => s.seatId === seatId)) return 'selected';
    if (bookedSeats.includes(seatId)) return 'booked';
    if (heldSeats.some(h => (typeof h === 'string' ? h === seatId : h.seatId === seatId))) return 'held';
    return 'available';
  };

  const getSeatCategoryPrice = (category) => {
    const cat = (category || 'regular').toLowerCase();
    return pricing[cat] || 200;
  };

  return (
    <div className="seat-grid-wrapper py-3">
      {/* Curved Cinema Screen */}
      <div className="cinema-screen-container">
        <div className="cinema-screen"></div>
        <div className="screen-label">ALL EYES THIS WAY • CINEMA SCREEN</div>
      </div>

      {/* Seating Layout Rows */}
      <div className="d-flex flex-column align-items-center gap-2 overflow-x-auto pb-4">
        {seatingLayout.map((rowObj, rIdx) => {
          const categoryPrice = getSeatCategoryPrice(rowObj.category);

          return (
            <div key={rIdx} className="d-flex align-items-center justify-content-center gap-2 w-100 my-1">
              {/* Row Label Left */}
              <div
                className="text-secondary fw-bold d-flex align-items-center justify-content-center"
                style={{ width: '24px', fontSize: '0.8rem' }}
              >
                {rowObj.row}
              </div>

              {/* Seats in Row */}
              <div className="d-flex justify-content-center flex-wrap">
                {rowObj.seats.map((seat) => {
                  const status = getSeatStatus(seat.seatId);
                  const isBooked = status === 'booked';
                  const isHeld = status === 'held';

                  return (
                    <button
                      key={seat.seatId}
                      type="button"
                      disabled={isBooked || isHeld}
                      className={`seat-button ${status}`}
                      onClick={() => onSeatClick({
                        seatId: seat.seatId,
                        row: rowObj.row,
                        number: seat.number,
                        category: rowObj.category,
                        price: categoryPrice
                      })}
                      title={`${seat.seatId} (${rowObj.category}) - ₹${categoryPrice} [${status.toUpperCase()}]`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>

              {/* Row Label Right */}
              <div
                className="text-secondary fw-bold d-flex align-items-center justify-content-center"
                style={{ width: '24px', fontSize: '0.8rem' }}
              >
                {rowObj.row}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seating Legend */}
      <div
        className="d-flex flex-wrap align-items-center justify-content-center gap-4 pt-3 mt-3 border-top"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="seat-button" style={{ margin: 0, cursor: 'default' }}>1</span>
          <span className="text-secondary small">Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="seat-button selected" style={{ margin: 0, cursor: 'default' }}>1</span>
          <span className="text-secondary small">Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="seat-button held" style={{ margin: 0, cursor: 'default' }}>1</span>
          <span className="text-secondary small">Reserved (Hold)</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="seat-button booked" style={{ margin: 0, cursor: 'default' }}>1</span>
          <span className="text-secondary small">Sold Out</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
