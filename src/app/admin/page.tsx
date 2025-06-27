// src/app/admin/page.tsx
'use client';
import { useState } from 'react';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tür tanımı
interface Kayit {
  id: number;
  adSoyad: string;
  okul: string;
  createdAt: string;
}

// Excel dışa aktarma
function exportToExcel(kayitlar: Kayit[]) {
  const worksheetData = kayitlar.map((k, i) => ({
    '#': i + 1,
    'Ad Soyad': k.adSoyad,
    'Okul': k.okul,
    'Durum': i < 20 ? 'Asil' : i < 25 ? 'Yedek' : 'Geçersiz',
    'Kayıt Tarihi': new Date(k.createdAt).toLocaleString('tr-TR'),
  }));

  const worksheet = utils.json_to_sheet(worksheetData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Kayıtlar');
  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `kayitlar_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// PDF dışa aktarma
function exportToPDF(kayitlar: Kayit[]) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text('Kayıt Listesi', 14, 15);
  const tableData = kayitlar.map((k, i) => [
    i + 1,
    k.adSoyad,
    k.okul,
    i < 20 ? 'Asil' : i < 25 ? 'Yedek' : 'Geçersiz',
    new Date(k.createdAt).toLocaleString('tr-TR'),
  ]);
  autoTable(doc, {
    head: [['#', 'Ad Soyad', 'Okul', 'Durum', 'Tarih']],
    body: tableData,
    startY: 20,
  });
  doc.save(`kayitlar_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });
  const [kayitlar, setKayitlar] = useState<Kayit[]>([]);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (form.username === 'argem' && form.password === 'argem1234') {
      setAuth(true);
      fetchKayitlar();
    } else {
      setError('Kullanıcı adı veya şifre yanlış.');
    }
  };

  const fetchKayitlar = async () => {
    const res = await fetch('/api/admin');
    const data = await res.json();
    setKayitlar(data);
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('Bu kaydı silmek istediğinizden emin misiniz?');
    if (!confirm) return;
    await fetch(`/api/delete/${id}`, { method: 'DELETE' });
    fetchKayitlar();
  };

  if (!auth) {
    return (
      <main className="min-h-screen bg-blue-100 flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm"
        >
          <h2 className="text-xl font-bold text-center text-blue-700 mb-4">Admin Girişi</h2>
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="mb-4 p-3 w-full border rounded"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mb-4 p-3 w-full border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
          >
            Giriş Yap
          </button>
          {error && (
            <p className="mt-4 text-center text-sm text-red-600 bg-red-100 p-2 rounded">
              {error}
            </p>
          )}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Kayıt Listesi</h1>
          <div className="flex gap-3">
            <button
              onClick={() => exportToExcel(kayitlar)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Excel Olarak İndir
            </button>
            <button
              onClick={() => exportToPDF(kayitlar)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              PDF Olarak İndir
            </button>
          </div>
        </div>

        <table className="w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-blue-100 text-gray-700">
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Ad Soyad</th>
              <th className="border px-2 py-1">Okul</th>
              <th className="border px-2 py-1">Durum</th>
              <th className="border px-2 py-1">Tarih</th>
              <th className="border px-2 py-1">Sil</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.map((k, i) => (
              <tr key={k.id} className="hover:bg-gray-50 text-sm">
                <td className="border px-2 py-1 text-center">{i + 1}</td>
                <td className="border px-2 py-1">{k.adSoyad}</td>
                <td className="border px-2 py-1">{k.okul}</td>
                <td className="border px-2 py-1 text-center">
                  {i < 20 ? 'Asil' : i < 25 ? 'Yedek' : 'Geçersiz'}
                </td>
                <td className="border px-2 py-1 text-gray-500">
                  {new Date(k.createdAt).toLocaleString('tr-TR')}
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Toplam: {kayitlar.length} kayıt
        </p>
      </div>
    </main>
  );
}
