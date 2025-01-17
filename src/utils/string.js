import moment from "moment";

export const formatDate = (date, format = 'MM/DD/YYYY') => {
    return moment(date).format(format);
};

//round to 3 decimal because the fee rate is .0000017
export const feeRatePercentage = (fee_rate) => {
    return (fee_rate * 100).toFixed(3) + "%";
};

//having the .toString saved in a variable breaks it so doing this instead
export const addCommas = (total, roundToWholeNumber = false) => roundToWholeNumber ? Math.round(total).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const funLookAtFunction = (param1, param2 = null) => {
    console.log("looking at your firstParam:", param1)
    if (param2) {
        console.log("looking at your secondParam:", param2)
    }
    return param1
}

export function stringIsEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}