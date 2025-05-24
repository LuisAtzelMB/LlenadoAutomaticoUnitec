"use client";

import { useState } from "react";

type CSVData = Record<string, string>;
type CSVHeaders = string[];

export default function CSVViewer() {
  const [data, setData] = useState<CSVData[]>([]);
  const [headers, setHeaders] = useState<CSVHeaders>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      parseCSV(content);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      setHeaders([]);
      setData([]);
      return;
    }

    // Obtener headers (primera línea)
    const csvHeaders = lines[0].split(",").map((header) => header.trim());
    setHeaders(csvHeaders);

    // Procesar las demás líneas
    const csvData = lines.slice(1).map((line) => {
      const values = line.split(",");
      return csvHeaders.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim() || "";
        return obj;
      }, {} as CSVData);
    });

    setData(csvData);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cargador de archivos CSV</h1>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Selecciona tu archivo CSV:
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {fileName && (
          <p className="mt-2 text-sm text-gray-600">
            Archivo seleccionado: {fileName}
          </p>
        )}
      </div>

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3">Datos del CSV</h2>
          <div className="overflow-auto max-h-96 border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Mostrando {data.length} registros
          </p>
        </div>
      )}
    </div>
  );
}
