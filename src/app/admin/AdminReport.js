"use client";

import { useState } from "react";
import { getGlobalReportData } from "@/app/actions/admin";

export default function AdminReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert("Ju lutem zgjidhni datën e fillimit dhe të mbarimit.");
      return;
    }

    setLoading(true);
    const result = await getGlobalReportData(startDate, endDate);
    
    if (result.success) {
      const data = result.data;
      
      // Calculate some aggregates
      const totalIncome = data.finances.filter(f => f.type === "INCOME").reduce((sum, f) => sum + f.amount, 0);
      const totalExpense = data.finances.filter(f => f.type === "EXPENSE").reduce((sum, f) => sum + f.amount, 0);
      
      // Create CSV Content
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
      
      // Section 1: Overview
      csvContent += "PERMBLEDHJE GLOBALE\n";
      csvContent += `Nga data,${startDate},Deri ne date,${endDate}\n\n`;
      csvContent += `Sallone te reja,${data.salons.length}\n`;
      csvContent += `Perdorues te rinj,${data.users.length}\n`;
      csvContent += `Rezervime Totale,${data.bookings.length}\n`;
      csvContent += `Te Ardhura Totale,${totalIncome}\n`;
      csvContent += `Shpenzime Totale,${totalExpense}\n\n`;

      // Section 2: Finances Breakdown
      csvContent += "DETANJET E FINANCAVE\n";
      csvContent += "Data,Salloni,Lloji,Shuma,Pershkrimi\n";
      data.finances.forEach(f => {
        csvContent += `"${new Date(f.date).toLocaleDateString()}","${f.salon.name}","${f.type === 'INCOME' ? 'Hyrje' : 'Dalje'}","${f.amount}","${f.description.replace(/"/g, '""')}"\n`;
      });

      // Section 3: Bookings Breakdown
      csvContent += "\nDETANJET E REZERVIMEVE\n";
      csvContent += "Data,Salloni,Sherbimi,Cmimi,Statusi\n";
      data.bookings.forEach(b => {
        csvContent += `"${new Date(b.date).toLocaleDateString()}","${b.salon.name}","${b.service.name}","${b.service.price}","${b.status}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Raporti_Plote_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Pati një gabim gjatë gjenerimit të raportit: " + result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex gap-4 items-center">
      <input 
        type="date" 
        className="input" 
        value={startDate} 
        onChange={(e) => setStartDate(e.target.value)} 
        placeholder="Nga data"
      />
      <span className="text-muted">-</span>
      <input 
        type="date" 
        className="input" 
        value={endDate} 
        onChange={(e) => setEndDate(e.target.value)} 
        placeholder="Deri në datë"
      />
      <button 
        className="btn btn-primary" 
        onClick={handleGenerateReport}
        disabled={loading}
      >
        {loading ? "Duke gjeneruar..." : "Gjenero Raport i plotë"}
      </button>
    </div>
  );
}
