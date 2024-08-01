export const downloadCSV = (data, headers, title) => {
    const csvHeaders = headers.map((header) => header.title).join(",");
  
    let csvContent = csvHeaders + "\n";
  
    data.forEach((row) => {
      const rowContent = headers
        .map((header) => {
          const value = row[header.key];
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",");
      csvContent += rowContent + "\n";
    });
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${title}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };