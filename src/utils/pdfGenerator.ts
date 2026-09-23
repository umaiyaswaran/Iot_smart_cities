import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Team, EventSettings } from '../types';

export function generateAttendanceExcel(settings: EventSettings, teams: Team[]) {
  const rows = teams.flatMap((team) => {
    if (!team.members?.length) {
      return [{
        'S.No': '',
        'Team No': `Team ${team.teamNumber}`,
        'Team Name': team.teamName,
        'Member Name': 'No members recorded',
        'Register No': '',
        'College Name': '',
        'Phone Number': '',
        Department: '',
        'Academic Year': '',
        Attendance: 'Absent',
      }];
    }

    return team.members.map((member) => ({
      'S.No': '',
      'Team No': `Team ${team.teamNumber}`,
      'Team Name': team.teamName,
      'Member Name': member.name,
      'Register No': member.registerNumber || '-',
      'College Name': member.collegeName || 'MSEC',
      'Phone Number': member.phoneNumber || '-',
      Department: member.department || 'Civil Engg',
      'Academic Year': member.academicYear || '-',
      Attendance: member.attendance,
    }));
  });

  rows.forEach((row, index) => {
    row['S.No'] = index + 1;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 7 }, { wch: 12 }, { wch: 24 }, { wch: 26 }, { wch: 20 },
    { wch: 34 }, { wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  XLSX.writeFile(workbook, `Euphoria26_Attendance_${settings.eventName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function generateAttendancePDF(settings: EventSettings, teams: Team[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header styling
  doc.setFillColor(6, 78, 59); // Deep emerald / forest green
  doc.rect(0, 0, 297, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MEENAKSHI SUNDARAJAN ENGINEERING COLLEGE', 148.5, 9, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Autonomous | Managed by I.I.E.T. Society | Affiliated to Anna University', 148.5, 15, { align: 'center' });
  doc.text('Department of Civil Engineering & Eco Design Club', 148.5, 21, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Euphoria'26 – IoT Based Smart Cities Challenge | OFFICIAL ATTENDANCE SHEET", 148.5, 27, { align: 'center' });

  // Event meta box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Date: ${settings.date}`, 14, 37);
  doc.text(`Time: ${settings.time}`, 100, 37);
  doc.text(`Venue: ${settings.venue}`, 180, 37);

  const generatedDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated: ${generatedDate}`, 240, 37);

  // Table rows
  const tableRows: any[] = [];
  let sNo = 1;

  teams.forEach((team) => {
    if (team.members && team.members.length > 0) {
      team.members.forEach((member) => {
        tableRows.push([
          sNo++,
          `Team ${team.teamNumber}`,
          team.teamName,
          member.name,
          member.registerNumber || '-',
          member.collegeName || 'MSEC',
          member.phoneNumber || '-',
          member.department || 'Civil Engg',
          member.academicYear || '-',
          member.attendance,
        ]);
      });
    } else {
      tableRows.push([
        sNo++,
        `Team ${team.teamNumber}`,
        team.teamName,
        'No members recorded',
        '-',
        '-',
        '-',
        '-',
        '-',
        'Absent',
      ]);
    }
  });

  autoTable(doc, {
    startY: 42,
    head: [[
      'S.No',
      'Team No',
      'Team Name',
      'Member Name',
      'Register No',
      'College Name',
      'Phone Number',
      'Department',
      'Academic Year',
      'Attendance',
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244], // Light mint green
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 18 },
      2: { cellWidth: 40 },
      3: { cellWidth: 35 },
      4: { halign: 'center', cellWidth: 26 },
      5: { cellWidth: 48 },
      6: { halign: 'center', cellWidth: 25 },
      7: { cellWidth: 26 },
      8: { halign: 'center', cellWidth: 22 },
      9: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 9) {
        if (data.cell.raw === 'Present') {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // Red
        }
      }
    },
    margin: { left: 12, right: 12 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Faculty Coordinator: Department of Civil Engineering | Eco Design Club, MSEC',
      14,
      202
    );
    doc.text(`Page ${i} of ${pageCount}`, 275, 202, { align: 'right' });
  }

  doc.save(`Euphoria26_Attendance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generateWinnersPDF(settings: EventSettings, teams: Team[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(6, 78, 59); // Dark green
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('MEENAKSHI SUNDARAJAN ENGINEERING COLLEGE', 105, 10, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Autonomous | Managed by I.I.E.T. Society | Affiliated to Anna University', 105, 16, { align: 'center' });
  doc.text('Department of Civil Engineering & Eco Design Club', 105, 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Euphoria'26 – IoT Based Smart Cities Challenge | OFFICIAL WINNERS & RESULTS", 105, 29, { align: 'center' });

  // Event Meta
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Date: ${settings.date}`, 14, 43);
  doc.text(`Venue: ${settings.venue}`, 80, 43);

  const generatedDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.setFont('helvetica', 'italic');
  doc.text(`Published: ${generatedDate}`, 150, 43);

  // Top 3 Podium summary
  const evaluatedTeams = teams
    .filter((t) => t.evaluationStatus === 'Evaluated' && t.totalScore !== null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  let startY = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59);
  doc.text('TOP 3 WINNERS OF THE CHALLENGE', 14, startY);
  startY += 5;

  const positions = ['1st Place (Winner)', '2nd Place (1st Runner Up)', '3rd Place (2nd Runner Up)'];
  const posColors = [
    [254, 240, 138], // Gold tint
    [241, 245, 249], // Silver tint
    [254, 215, 170], // Bronze tint
  ];

  for (let i = 0; i < 3; i++) {
    const winner = evaluatedTeams[i];
    doc.setFillColor(posColors[i][0], posColors[i][1], posColors[i][2]);
    doc.roundedRect(14, startY, 182, 22, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, startY, 182, 22, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${positions[i]}: ${winner ? `Team ${winner.teamNumber} - ${winner.teamName}` : 'Pending Evaluation'}`, 18, startY + 7);

    if (winner) {
      const memberNames = winner.members.map((m) => m.name).join(', ') || 'Registered Members';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Members: ${memberNames}`, 18, startY + 13);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 78, 59);
      doc.text(
        `Technical Quiz: ${winner.technicalQuizScore ?? 0}/50  |  IoT Simulation: ${winner.iotSimulationScore ?? 0}/50  |  TOTAL: ${winner.totalScore ?? 0}/100`,
        18,
        startY + 19
      );
    }
    startY += 26;
  }

  startY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59);
  doc.text('COMPLETE OFFICIAL RANKING LEADERBOARD', 14, startY);

  const fullRankingRows = evaluatedTeams.map((t) => [
    t.rank ?? '-',
    `Team ${t.teamNumber}`,
    t.teamName,
    t.members.map((m) => m.name).join(', ') || '-',
    `${t.technicalQuizScore ?? 0} / 50`,
    `${t.iotSimulationScore ?? 0} / 50`,
    `${t.totalScore ?? 0} / 100`,
  ]);

  autoTable(doc, {
    startY: startY + 4,
    head: [[
      'Rank',
      'Team No',
      'Team Name',
      'Members',
      'Technical Quiz',
      'IoT Simulation',
      'Total Score',
    ]],
    body: fullRankingRows,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 50 },
      4: { halign: 'center', cellWidth: 24 },
      5: { halign: 'center', cellWidth: 24 },
      6: { halign: 'center', fontStyle: 'bold', textColor: [5, 150, 105], cellWidth: 20 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Official Result Document | Department of Civil Engineering & Eco Design Club', 14, 287);
    doc.text(`Page ${i} of ${pageCount}`, 196, 287, { align: 'right' });
  }

  doc.save(`Euphoria26_Official_Winners_${new Date().toISOString().slice(0, 10)}.pdf`);
}
