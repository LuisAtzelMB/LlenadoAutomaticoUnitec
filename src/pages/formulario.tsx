import { useState, useEffect, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";

// INTERFACES TYPESCRIPT
interface TextField {
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: { r: number; g: number; b: number };
}

export default function PDFEditor() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const pdfRef = useRef<HTMLIFrameElement>(null);

  // 1. CONFIGURACIÓN INICIAL - CAMBIA ESTOS VALORES SEGÚN TUS NECESIDADES
  const pdfPath = "/documents/formato-pdf.pdf"; // Ruta de tu PDF en la carpeta public

  // Define aquí las variables que quieres imprimir en el PDF
  const textFields: TextField[] = [
    {
      text: "Fecha", // Texto fijo o variable
      x: 373, // Posición X en puntos (1/72 de pulgada)
      y: 626, // Posición Y
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    {
      text: "NOMBRE DEL CLIENTE", // Texto fijo o variable
      x: 53, // Posición X en puntos (1/72 de pulgada)
      y: 618, // Posición Y
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    {
      text: "Numero de cuenta", // Texto fijo o variable
      x: 75, // Posición X en puntos (1/72 de pulgada)
      y: 602, // Posición Y
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    {
      text: "Carrera", // Texto fijo o variable
      x: 220, // Posición X en puntos (1/72 de pulgada)
      y: 602, // Posición Y
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    {
      text: "Organización o dependencia", // Texto fijo o variable
      x: 140, // Posición X en puntos (1/72 de pulgada)
      y: 585, // Posición Y
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    {
      text: "Nombre del responsable del programa", // Texto fijo o variable
      x: 180, // Posición X en puntos (1/72 de pulgada)
      y: 567, // Posición Y
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    {
      text: "Nombre del programa", // Texto fijo o variable
      x: 110, // Posición X en puntos (1/72 de pulgada)
      y: 553, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    {
      text: "Duración del Servicio Social de a", // Texto fijo o variable
      x: 145, // Posición X en puntos (1/72 de pulgada)
      y: 539, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    {
      text: "Duración del Servicio Social de ", // Texto fijo o variable
      x: 325, // Posición X en puntos (1/72 de pulgada)
      y: 539, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    //
    //6 satisfactorio 1 nada satisfactorio
    //
    //Responsabilidad
    // 6
    {
      text: "x ", // Texto fijo o variable
      x: 231, // Posición X en puntos (1/72 de pulgada)
      y: 458, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    // 5
    {
      text: "x ", // Texto fijo o variable
      x: 279, // Posición X en puntos (1/72 de pulgada)
      y: 458, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    // 4
    {
      text: "x ", // Texto fijo o variable
      x: 327, // Posición X en puntos (1/72 de pulgada)
      y: 458, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    // 3
    {
      text: "x ", // Texto fijo o variable
      x: 375, // Posición X en puntos (1/72 de pulgada)
      y: 458, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    // 2
    {
      text: "x ", // Texto fijo o variable
      x: 423, // Posición X en puntos (1/72 de pulgada)
      y: 458, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    // 1
    {
      text: "x ", // Texto fijo o variable
      x: 471, // Posición X en puntos (1/72 de pulgada)
      y: 458, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    // ejemplo de 1 pero de Iniciativa
    {
      text: "x ", // Texto fijo o variable
      x: 471, // Posición X en puntos (1/72 de pulgada)
      y: 443, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    // ejemplo de 1 pero de Colaboración
    {
      text: "x ", // Texto fijo o variable
      x: 471, // Posición X en puntos (1/72 de pulgada)
      y: 425, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
    // ejemplo de todo
    {
      text: "x ", // Texto fijo o variable
      x: 396, // Posición X en puntos (1/72 de pulgada)
      y: 107, // Posición Y 14 de diferencia entre cada rubrica
      size: 11,
      color: { r: 0, g: 0, b: 0 }, // Negro
    },
  ];

  // 2. FUNCIÓN PARA EDITAR EL PDF
  const editPdf = async (pdfBytes: ArrayBuffer) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Añadir todos los textos definidos
    textFields.forEach((field) => {
      firstPage.drawText(field.text, {
        x: field.x,
        y: field.y,
        size: field.size || 12,
        color: field.color
          ? rgb(field.color.r, field.color.g, field.color.b)
          : rgb(0, 0, 0),
      });
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  // 3. CARGA INICIAL DEL PDF
  const loadPdf = async () => {
    try {
      const response = await fetch(pdfPath);
      const pdfBytes = await response.arrayBuffer();
      const editedPdfUrl = await editPdf(pdfBytes);
      setPdfUrl(editedPdfUrl);
    } catch (error) {
      console.error("Error al cargar el PDF:", error);
    }
  };

  // 4. EFECTO PARA CARGAR EL PDF AL INICIAR
  useEffect(() => {
    loadPdf();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);

  // 5. RENDERIZADO
  return (
    <div className="pdf-editor">
      <h1>Documento Personalizado</h1>

      <div className="pdf-preview">
        {pdfUrl ? (
          <iframe
            ref={pdfRef}
            src={pdfUrl}
            width="100%"
            height="600px"
            title="Vista previa del PDF"
          />
        ) : (
          <p>Cargando documento...</p>
        )}
      </div>

      <style jsx>{`
        .pdf-editor {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .pdf-preview {
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
