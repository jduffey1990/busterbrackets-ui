export const currencyFormat = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const getMSTDate = () => {
    const now = new Date();

    // Check if daylight saving time is in effect
    const isDST = now.getTimezoneOffset() < 420; // MST is 420 minutes (UTC-7), MDT is 360 minutes (UTC-6)

    const mstOffset = isDST ? 6 : 7; // Use UTC-6 for MDT, UTC-7 for MST

    // Calculate the local MST/MDT time
    const mstDate = new Date(now.setHours(now.getUTCHours() - mstOffset));

    // Extract date components
    const year = mstDate.getFullYear();
    const month = (mstDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = mstDate.getDate().toString().padStart(2, '0');

    // Extract hours and minutes
    const hours = mstDate.getHours().toString().padStart(2, '0');
    const minutes = mstDate.getMinutes().toString().padStart(2, '0');

    // Return formatted string: YYYY-MM-DD HH:mm MST/MDT
    const timezone = isDST ? 'MDT' : 'MST'; // Adjust the timezone label
    return `${year}-${month}-${day}  ${hours}:${minutes} ${timezone}`;
};

