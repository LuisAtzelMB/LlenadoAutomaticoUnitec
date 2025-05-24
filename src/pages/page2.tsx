import { useState, ChangeEvent } from "react";

type CSVData = Record<string, string>[];

export default function Page2() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CSVData>([]);
  const [error, setError] = useState<string>("");

  // Maneja el cambio cuando se selecciona un archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setError("No se seleccionó ningún archivo.");
      return;
    }

    // Validación del archivo
    if (
      selectedFile.type === "text/csv" ||
      selectedFile.name.endsWith(".csv")
    ) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Por favor, sube un archivo CSV válido.");
    }
  };

  // Procesa el archivo CSV
  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo primero.");
      return;
    }

    try {
      const text = await file.text();
      const result = parseCSV(text);
      setData(result);
    } catch (err) {
      setError("Error al procesar el archivo CSV.");
      console.error(err);
    }
  };

  // Función para parsear el contenido CSV
  const parseCSV = (csvText: string): CSVData => {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map((header) => header.trim());

    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",");
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] ? values[index].trim() : "";
          return obj;
        }, {} as Record<string, string>);
      })
      .filter((row) => Object.values(row).some((val) => val !== ""));
  };

  return (
    <div>
      <h1>Subir Archivo CSV</h1>

      <input type="file" accept=".csv" onChange={handleFileChange} />

      <button onClick={handleUpload}>Procesar CSV</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data.length > 0 && (
        <div>
          <h2>Datos del CSV:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <br />
          {data.map((row, idx) => (
            <p key={idx}>{row.Nombre}</p>
          ))}
        </div>
      )}
    </div>
  );
}
