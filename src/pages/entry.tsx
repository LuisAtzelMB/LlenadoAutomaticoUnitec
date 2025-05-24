import { useState, ChangeEvent } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import JSZip from "jszip";

type CSVData = Record<string, string>[];

export default function Entry() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CSVData>([]);
  const [error, setError] = useState<string>("");
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);

  const pdfPath = "/documents/formato-pdf.pdf";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setError("No se seleccionó ningún archivo.");
      return;
    }

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

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo primero.");
      return;
    }

    try {
      const text = await file.text();
      const result = parseCSV(text);
      setData(result);

      const pdfBytes = await fetch(pdfPath).then((res) => res.arrayBuffer());
      const urls: string[] = [];
      for (const row of result) {
        const url = await generatePdfWithName(pdfBytes, row.Nombre || "");
        urls.push(url);
      }
      setPdfUrls(urls);
    } catch (err) {
      setError("Error al procesar el archivo CSV.");
      console.error(err);
    }
  };

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

  const generatePdfWithName = async (pdfBytes: ArrayBuffer, nombre: string) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawText(nombre, {
      x: 53,
      y: 618,
      size: 18,
      color: rgb(0, 0, 0),
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  // Descargar todos los PDFs en un ZIP
  const handleDownloadAllZip = async () => {
    const zip = new JSZip();

    for (let idx = 0; idx < pdfUrls.length; idx++) {
      const url = pdfUrls[idx];
      const response = await fetch(url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      zip.file(`pdf_${data[idx]?.Nombre || idx + 1}.pdf`, arrayBuffer);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "todos_los_pdfs.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1>Subir Archivo CSV</h1>

      <input type="file" accept=".csv" onChange={handleFileChange} />

      <button onClick={handleUpload}>Procesar CSV</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data.length > 0 && (
        <div>
          <button
            onClick={handleDownloadAllZip}
            style={{
              margin: "20px 0",
              padding: "10px 20px",
              background: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Descargar todos los PDF en ZIP
          </button>
          {data.map((row, idx) => (
            <div key={idx} style={{ marginBottom: 40 }}>
              <p>{row.Nombre}</p>
              {pdfUrls[idx] && (
                <iframe
                  src={pdfUrls[idx]}
                  width="800"
                  height="1000"
                  title={`PDF de ${row.Nombre}`}
                  style={{ border: "1px solid #ccc" }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
