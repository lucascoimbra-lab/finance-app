import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function HomePage() {
  return (
    <div className="container">
      <p><b>2025</b></p>
      <h1 className="title-text">Agosto</h1>
    </div>
  );
}

export default HomePage;