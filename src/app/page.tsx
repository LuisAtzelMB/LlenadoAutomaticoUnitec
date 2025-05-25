"use client";
import { useState, ChangeEvent } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import JSZip from "jszip";

type CSVData = Record<string, string>[];

export default function Test() {
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
        const url = await generatePdfWithData(pdfBytes, row);
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

  const generatePdfWithData = async (
    pdfBytes: ArrayBuffer,
    row: Record<string, string>
  ) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Mapeo de valores a coordenadas X para las X (1-6)
    const ratingCoordsX: Record<number, number> = {
      6: 231,
      5: 279,
      4: 327,
      3: 375,
      2: 423,
      1: 471,
    };

    // Coordenadas Y base para cada campo de evaluación
    const evaluationFieldsY: Record<string, number> = {
      ResponsabilidadEnSuTrabajo: 458,
      Iniciativa: 443,
      Colaboracion: 425,
      Orden: 407,
      AsistenciaPuntualidad: 390,
      RelacionConSuJefe: 360,
      RelacionConSusCompaneros: 342,
      Comunicacion: 324,
      EticaProfesional: 306,
      Disciplina: 288,
      FacilidadParaAprender: 258,
      CalidadDeTrabajo: 240,
      CumpleConLasExigenciasDelPuesto: 222,
      ImagenPersonal: 193,
      Conducta: 175,
    };
    // Campos especiales con coordenadas X e Y dinámicas
    const specialFieldsCoords: Record<
      string,
      Record<number, { x: number; y: number }>
    > = {
      ConsideraQueElDesempenoDelAlumnoFue: {
        6: { x: 243, y: 77 },
        5: { x: 292, y: 77 },
        4: { x: 339, y: 77 },
        3: { x: 387, y: 77 },
        2: { x: 435, y: 77 },
        1: { x: 484, y: 77 },
      },
      RecomendariaAlAlumno: {
        1: { x: 415, y: 54 }, //si
        0: { x: 475, y: 54 }, //no
      },
    };

    // Coordenadas para los demás campos (texto normal)
    const fieldPositions: Record<
      string,
      { x: number; y: number; size?: number }
    > = {
      Fecha: { x: 373, y: 626, size: 11 },
      Nombre: { x: 53, y: 618, size: 11 },
      NoDeCuenta: { x: 75, y: 602, size: 11 },
      Carrera: { x: 220, y: 602, size: 11 },
      OrganizacionODependencia: { x: 140, y: 585, size: 11 },
      NombreResponsablePrograma: { x: 180, y: 567, size: 11 },
      NombrePrograma: { x: 110, y: 553, size: 11 },
      DuracionDe: { x: 145, y: 539, size: 11 },
      DuracionA: { x: 325, y: 539, size: 11 },
      AdministracionDelTiempo: { x: 180, y: 139, size: 11 },
      RelacionesInterpersonales: { x: 180, y: 128, size: 11 },
      OrganizacionYplaneacion: { x: 180, y: 117, size: 11 },
      ComunicacionAsertiva: { x: 180, y: 106, size: 11 },
      CreatividadYsolucionDeProblemas: { x: 180, y: 96, size: 11 },
      Emprendedor: { x: 396, y: 139, size: 11 },
      Negociacion: { x: 396, y: 128, size: 11 },
      Autoeducacion: { x: 396, y: 117, size: 11 },
      EmpatiaYTolerancia: { x: 396, y: 107, size: 11 },
      ConsideraQueElDesempenoDelAlumnoFue: { x: 53, y: 65, size: 11 },

      Observaciones: { x: 53, y: 15, size: 11 },
    };

    // Dibujar cada campo en el PDF
    for (const [field, value] of Object.entries(row)) {
      // Campos especiales con coordenadas X e Y dinámicas
      if (specialFieldsCoords[field]) {
        const numericValue = parseInt(value);
        if (!isNaN(numericValue)) {
          const coords = specialFieldsCoords[field][numericValue];
          if (coords) {
            firstPage.drawText("x", {
              x: coords.x,
              y: coords.y,
              size: 11,
              color: rgb(0, 0, 0),
            });
          }
        }
      }
      // Campos de evaluación normales (solo X dinámica)
      else if (evaluationFieldsY[field]) {
        const numericValue = parseInt(value);
        if (!isNaN(numericValue)) {
          const xCoord = ratingCoordsX[numericValue];
          if (xCoord !== undefined) {
            firstPage.drawText("x", {
              x: xCoord,
              y: evaluationFieldsY[field],
              size: 11,
              color: rgb(0, 0, 0),
            });
          }
        }
      }
      // Otros campos (texto normal)
      else if (fieldPositions[field]) {
        const { x, y, size } = fieldPositions[field];
        firstPage.drawText(value || "", {
          x,
          y,
          size: size || 11,
          color: rgb(0, 0, 0),
        });
      }
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

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
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Generador de Constancias</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ marginRight: "10px" }}
        />
        <button
          onClick={handleUpload}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Procesar CSV
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
      )}

      {pdfUrls.length > 0 && (
        <div>
          <button
            onClick={handleDownloadAllZip}
            style={{
              margin: "20px 0",
              padding: "10px 20px",
              background: "#2196F3",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Descargar todos los PDFs (ZIP)
          </button>

          <div style={{ marginTop: "30px" }}>
            {data.map((row, idx) => (
              <div key={idx} style={{ marginBottom: "40px" }}>
                <h3 style={{ marginBottom: "10px" }}>
                  {row.Nombre || `Documento ${idx + 1}`}
                </h3>
                {pdfUrls[idx] && (
                  <iframe
                    src={pdfUrls[idx]}
                    width="100%"
                    height="800px"
                    style={{ border: "1px solid #ddd", borderRadius: "5px" }}
                    title={`PDF - ${row.Nombre || idx + 1}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
