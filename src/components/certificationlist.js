import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('/api/certificates');
        
        setCertificates(response.data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div className="certificates-container">
      <h2 className="section-title">Certifications</h2>
      <div className="certificates-grid">
        {certificates.map((certificate) => (
          <div key={certificate._id} className="certificate-card">
            {/* The image field is optional, but if your schema has one, you can display it here. */}
            <img src={certificate.imageUrl || "/placeholder.svg"} alt={certificate.title} className="certificate-image" />
            <h3 className="certificate-title">{certificate.title}</h3>
            <div className="certificate-code">ID: {certificate.code}</div>
            <p className="certificate-description">Issued by: {certificate.issuer}</p>
            {/* Display the date, formatted as a string */}
            <div className="certificate-date">Date: {new Date(certificate.dateIssued).toLocaleDateString()}</div>
            {certificate.certificateUrl && (
              <a href={certificate.certificateUrl} className="certificate-link" target="_blank" rel="noopener noreferrer">
                View Certificate
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificateList;