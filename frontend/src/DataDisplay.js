import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataDisplay = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/data');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Data from MySQL Database</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Column 1</th>
            <th>Column 2</th>
            {/* Add more columns as needed */}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.column1}</td>
              <td>{item.column2}</td>
              {/* Render other columns */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataDisplay;
