'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';

type FormData = {
  id: string;
  name: string;
  email: string;
  school: string;
};

export default function AdminPage() {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchData = async () => {
    const res = await fetch('/api/forms');
    const data = await res.json();
    setFormData(data);
  };

  const handleLogin = () => {
    if (password === 'argem1234') {
      setIsAuthenticated(true);
    } else {
      alert('Hatalı şifre');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Bu kaydı silmek istediğinizden emin misiniz?');
    if (!confirmed) return;

    const res = await fetch(`/api/forms/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setFormData(prev => prev.filter(item => item.id !== id));
    } else {
      alert('Silme işlemi başarısız.');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Ad Soyad', 'Email', 'Okul']],
      body: formData.map(item => [item.name, item.email, item.school]),
    });
    doc.save('kayıtlar.pdf');
  };

  const exportExcel = () => {
    const worksheet = utils.json_to_sheet(
      formData.map(({ name, email, school }) => ({
        'Ad Soyad': name,
        Email: email,
        Okul: school,
      }))
    );
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'kayıtlar.xlsx');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md">
          <h1 className="text-2xl font-bold mb-4">Admin Girişi</h1>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kayıtlar</h1>
        <div className="space-x-2">
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
          >
            PDF Aktar
          </button>
          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
          >
            Excel Aktar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Ad Soyad</th>
              <th className="p-2">Email</th>
              <th className="p-2">Okul</th>
              <th className="p-2">Sil</th>
            </tr>
          </thead>
          <tbody>
            {formData.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.email}</td>
                <td className="p-2">{item.school}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
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
