export const addCommas = (total) => {
    return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

export const trimDate = (date) => {
    return date.split('T')[0];
  };

  export const feeRatePercentage = (fee_rate) => {
    return (fee_rate * 100).toFixed(3) + '%';
  };
  
  export const addCommasNoDecimal = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',').split('.')[0];
  };

  export const totalCalc = (value, fee_rate) => {
    return (value * fee_rate).toFixed(2);
  };

  export const downloadCSV = (data, headers) => {
    const csvHeaders = headers.map(header => header.title).join(",");
  
    let csvContent = csvHeaders + "\n";
  
    data.forEach(row => {
      const rowContent = headers.map(header => {
        const value = row[header.key];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",");
      csvContent += rowContent + "\n";
    });
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "billingData.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };