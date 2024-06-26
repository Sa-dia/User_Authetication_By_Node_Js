import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import CsvToXmlRoom from './superuser/upload_csv_xml/CsvToXmlRoom'
import CsvToXmlTeacher from './superuser/upload_csv_xml/CsvToXmlTeacher'
import CsvToXmlStudent from './superuser/upload_csv_xml/CsvToXmlStudent'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <CsvToXmlRoom/>
    <CsvToXmlTeacher/>
    <CsvToXmlStudent/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
