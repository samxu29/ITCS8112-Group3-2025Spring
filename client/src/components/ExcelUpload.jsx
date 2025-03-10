import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ExcelUpload({ onClose, onUploadSuccess }) {
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [allData, setAllData] = useState([]);
  const [error, setError] = useState('');

  const validateAndTransformData = (data) => {
    return data.map(row => {
      // Convert keys to lowercase and trim whitespace
      const transformedRow = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        // Convert key to lowercase and remove spaces
        const newKey = key.toLowerCase().replace(/\s+/g, '');
        transformedRow[newKey] = value;
      });

      // Ensure all required fields are present
      const record = {
        name: transformedRow.name || '',
        position: transformedRow.position || '',
        level: transformedRow.level || ''
      };

      // Validate that required fields are not empty
      if (!record.name || !record.position || !record.level) {
        throw new Error('Missing required fields (name, position, or level)');
      }

      return record;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setError('Excel file is empty');
          return;
        }

        // Validate and transform the data
        const validData = validateAndTransformData(jsonData);
        
        // Store all data but only show first 10 rows in preview
        setAllData(validData);
        setPreviewData(validData.slice(0, 10));
      } catch (error) {
        console.error('Error processing file:', error);
        setError(error.message || 'Error processing Excel file');
        setPreviewData([]);
        setAllData([]);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    reader.readAsBinaryString(file);
  };

  const handleConfirmUpload = async () => {
    try {
      if (allData.length === 0) {
        setError('No valid data to upload');
        return;
      }

      const response = await fetch('http://localhost:5050/record/bulk-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: allData }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading records:', error);
      setError(error.message || 'Error uploading records');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Excel File</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {previewData.length > 0 && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Preview (First 10 rows)</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Position</th>
                      <th className="px-4 py-2 text-left">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2">{row.position}</td>
                        <td className="px-4 py-2">{row.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirm Upload ({allData.length} records)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 