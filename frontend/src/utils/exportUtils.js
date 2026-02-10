// Utility functions for exporting data

// Convert array of objects to CSV
export const convertToCSV = (data, columns) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => col.label).join(',');

  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];

      // Handle null/undefined
      if (value === null || value === undefined) {
        value = '';
      }

      // Convert to string and escape quotes
      value = String(value).replace(/"/g, '""');

      // Wrap in quotes if contains comma, newline, or quote
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }

      return value;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
};

// Download CSV file
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export jobs to CSV
export const exportJobsToCSV = (jobs) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'client_name', label: 'Client Name' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'required_skills', label: 'Required Skills' },
    { key: 'assigned_to_name', label: 'Assigned To' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'created_by_name', label: 'Created By' },
    { key: 'created_at', label: 'Created At' }
  ];

  const csv = convertToCSV(jobs, columns);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `jobs_export_${timestamp}.csv`);
};

// Export operatives to CSV
export const exportOperativesToCSV = (operatives) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'skills', label: 'Skills' },
    { key: 'location', label: 'Location' },
    { key: 'availability', label: 'Availability' },
    { key: 'created_at', label: 'Created At' }
  ];

  const csv = convertToCSV(operatives, columns);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `operatives_export_${timestamp}.csv`);
};

// Export risk assessments to CSV
export const exportRiskAssessmentsToCSV = (assessments) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'job_id', label: 'Job ID' },
    { key: 'hazards', label: 'Hazards' },
    { key: 'risks', label: 'Risks' },
    { key: 'control_measures', label: 'Control Measures' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' }
  ];

  const csv = convertToCSV(assessments, columns);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `risk_assessments_export_${timestamp}.csv`);
};

// Export method statements to CSV
export const exportMethodStatementsToCSV = (statements) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'job_id', label: 'Job ID' },
    { key: 'description', label: 'Description' },
    { key: 'steps', label: 'Steps' },
    { key: 'equipment_required', label: 'Equipment Required' },
    { key: 'safety_requirements', label: 'Safety Requirements' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' }
  ];

  const csv = convertToCSV(statements, columns);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `method_statements_export_${timestamp}.csv`);
};

// Export to JSON format (alternative format)
export const exportToJSON = (data, filename) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
