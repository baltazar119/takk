'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FormData {
  id: number;
  name: string;
  email: string;
  school: string;
  phone: string;
  createdAt: string;
}

export default function AdminPage() {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const fetchData = async () => {
    try {
      const response = await axios.get<FormData[]>('/api/forms');
      setFormData(response.data);
    } catch (error) {
      console.error('Veri alınırken hata oluştu:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/forms/${id}`);
      setFormData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Ad Soyad', 'E-posta', 'Okul', 'Telefon', 'Tarih']],
      body: formData.map(({ name, email, school, phone, createdAt }) => [name, email, school, phone, createdAt])
    });
    doc.save('veriler.pdf');
  };

  const exportExcel = () => {
    const ws = utils.json_to_sheet(formData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Veriler');
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'veriler.xlsx');
  };

  const handleLogin = () => {
    if (password === 'argem1234') {
      setIsAuthenticated(true);
    } else {
      alert('Şifre yanlış');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-80">
          <h2 className="text-xl font-bold mb-4">Admin Girişi</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className="border p-2 w-full mb-4 rounded"
          />
          <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-center">Kayıtlı Katılımcılar</h1>

      <div className="flex justify-center gap-4 mb-6">
        <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          PDF İndir
        </button>
        <button onClick={exportExcel} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Excel İndir
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">Ad Soyad</th>
              <th className="py-2 px-4 border">E-posta</th>
              <th className="py-2 px-4 border">Okul</th>
              <th className="py-2 px-4 border">Telefon</th>
              <th className="py-2 px-4 border">Tarih</th>
              <th className="py-2 px-4 border">Sil</th>
            </tr>
          </thead>
          <tbody>
            {formData.map((form) => (
              <tr key={form.id} className="text-center">
                <td className="py-2 px-4 border">{form.name}</td>
                <td className="py-2 px-4 border">{form.email}</td>
                <td className="py-2 px-4 border">{form.school}</td>
                <td className="py-2 px-4 border">{form.phone}</td>
                <td className="py-2 px-4 border">{new Date(form.createdAt).toLocaleString('tr-TR')}</td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
