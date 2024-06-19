import React, { useState } from 'react';
import Papa from 'papaparse';

const UploadFile = () => {
  const [jsonData, setJsonData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setJsonData(results.data);
        },
      });
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>
      {/* Optional: Display data in table format */}
      <table>
        <thead>
          <tr>
            {jsonData.length > 0 && Object.keys(jsonData[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jsonData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UploadFile;
