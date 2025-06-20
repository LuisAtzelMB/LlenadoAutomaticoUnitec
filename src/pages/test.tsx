"use client";
import "../app/globals.css";
import "../app/layout.tsx";
import { useState, ChangeEvent } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import JSZip from "jszip";
import Papa from "papaparse";
import fontkit from "@pdf-lib/fontkit";

type CSVData = Record<string, string>[];

export default function Test() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CSVData>([]);
  const [error, setError] = useState<string>("");
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);

  const pdfPath = "/documents/formato-pdf.pdf";

  const normalizeText = (text: string): string => {
    return text.normalize("NFC");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
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

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      setError("Por favor, selecciona un archivo primero.");
      return;
    }

    try {
      const text = await file.text();
      const result = parseCSV(text);

      const filteredData = result.filter(
        (row) => row.Nombre && row.Nombre.trim() !== ""
      );

      if (filteredData.length === 0) {
        throw new Error(
          "El CSV no contiene datos válidos con la columna 'Nombre'."
        );
      }

      setData(filteredData);
      const pdfBytes = await fetch(pdfPath).then((res) => res.arrayBuffer());

      const urls = await Promise.all(
        filteredData.map((row) => generatePdfWithData(pdfBytes, row))
      );
      setPdfUrls(urls);
    } catch (err) {
      setError(
        `Error al procesar el archivo CSV: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.error(err);
    }
  };

  const parseCSV = (csvText: string): CSVData => {
    const result = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => normalizeText(value.trim()),
    });

    if (result.errors.length > 0) {
      console.warn("Errores al parsear CSV:", result.errors);
    }

    return result.data;
  };

  const generatePdfWithData = async (
    pdfBytes: ArrayBuffer,
    row: Record<string, string>
  ) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch("/fonts/Roboto-Regular.ttf").then((res) =>
      res.arrayBuffer()
    );
    const customFont = await pdfDoc.embedFont(fontBytes, { subset: false });

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Asegurarnos que exista la segunda página
    const secondPage =
      pages.length > 1
        ? pages[1]
        : pdfDoc.addPage([firstPage.getWidth(), firstPage.getHeight()]);

    const ratingCoordsX: Record<number, number> = {
      6: 231,
      5: 279,
      4: 327,
      3: 375,
      2: 423,
      1: 471,
    };

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

    const specialFieldsCoords: Record<
      string,
      Record<string, { x: number; y: number }>
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
        1: { x: 415, y: 54 },
        0: { x: 475, y: 54 },
      },
    };

    // Coordenadas para la primera página
    const fieldPositionsPage1: Record<
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
      Observaciones: { x: 162, y: 39, size: 11 },
    };

    // Coordenadas para la segunda página (nuevas coordenadas)
    const fieldPositionsPage2: Record<
      string,
      { x: number; y: number; size?: number }
    > = {
      Nombre: { x: 87, y: 493, size: 11 }, // Nueva posición para Nombre
      NoDeCuenta: { x: 385, y: 493, size: 11 }, // Nueva posición para NoDeCuenta
      DuracionDe: { x: 200, y: 312, size: 11 }, // Nueva posición para DuracionDe
      atencion: { x: 135, y: 581, size: 11 }, // Nueva rúbrica
    };

    // Procesar campos en la primera página
    for (const [field, value] of Object.entries(row)) {
      if (specialFieldsCoords[field]) {
        const numericValue = parseInt(value);
        if (!isNaN(numericValue)) {
          const coords = specialFieldsCoords[field][numericValue];
          if (coords) {
            firstPage.drawText("x", {
              x: coords.x,
              y: coords.y,
              size: 11,
              font: customFont,
              color: rgb(0, 0, 0),
            });
          }
        }
      } else if (evaluationFieldsY[field]) {
        const numericValue = parseInt(value);
        if (!isNaN(numericValue)) {
          const xCoord = ratingCoordsX[numericValue];
          if (xCoord !== undefined) {
            firstPage.drawText("x", {
              x: xCoord,
              y: evaluationFieldsY[field],
              size: 11,
              font: customFont,
              color: rgb(0, 0, 0),
            });
          }
        }
      } else if (fieldPositionsPage1[field]) {
        const { x, y, size } = fieldPositionsPage1[field];
        firstPage.drawText(value || "", {
          x,
          y,
          size: size || 11,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    // Procesar campos en la segunda página
    for (const [field, value] of Object.entries(row)) {
      if (fieldPositionsPage2[field]) {
        const { x, y, size } = fieldPositionsPage2[field];
        secondPage.drawText(value || "", {
          x,
          y,
          size: size || 11,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  const handleDownloadAllZip = async (): Promise<void> => {
    const zip = new JSZip();
    await Promise.all(
      pdfUrls.map(async (url, idx) => {
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(`constancia_${data[idx]?.Nombre || idx + 1}.pdf`, blob);
      })
    );

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "constancias.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Generador de Constancias</h1>
      <h2>Paso 1</h2>
      <div style={{ marginBottom: "20px" }}>
        <a
          href="/documents/FormularioEntradaDatos.xlsx"
          download="FormularioEntradaDatos.xlsx"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#388E3C")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#4CAF50")
          }
        >
          Descargar Formato CSV para guardar tus evaluaciones
        </a>
        <p style={{ marginTop: "10px", color: "#555", fontSize: "14px" }}>
          Descarga el archivo de ejemplo{" "}
          <strong>FormularioEntradaDatos.xlsx</strong> para usarlo como base en
          la generación de constancias.
        </p>
      </div>
      <h2>Paso 2</h2>
      <div style={{ marginBottom: "20px" }}>
        <p style={{ marginTop: "10px", color: "#555", fontSize: "14px" }}>
          Una vez lleno su formato en excel con los alumnos, guardelo usando el
          formato <strong>CSV UTF-8 (delimitado por comas)(*.csv)</strong>. Ya
          que si usa otro formato habra errores.
        </p>
      </div>
      <h2>Paso 3</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleUpload} style={buttonStyle}>
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
            style={{ ...buttonStyle, backgroundColor: "#2196F3" }}
          >
            Descargar todos los PDFs (ZIP)
          </button>

          <div style={{ marginTop: "30px" }}>
            {data.map((row, idx) => (
              <div key={idx} style={{ marginBottom: "40px" }}>
                <h3>{row.Nombre || `Documento ${idx + 1}`}</h3>
                <iframe
                  src={pdfUrls[idx]}
                  width="100%"
                  height="800px"
                  style={{ border: "1px solid #ddd", borderRadius: "5px" }}
                  title={`PDF - ${row.Nombre || idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
