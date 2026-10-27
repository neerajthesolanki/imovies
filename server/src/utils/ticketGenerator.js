import QRCode from 'qrcode';

export const generateTicketQR = async (bookingData) => {
  try {
    const qrPayload = JSON.stringify({
      ref: bookingData.bookingReference,
      movie: bookingData.movieTitle,
      seats: bookingData.seats,
      showTime: bookingData.showTime,
      showDate: bookingData.showDate,
      theatre: bookingData.theatreName,
      screen: bookingData.screenName
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 250,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};
