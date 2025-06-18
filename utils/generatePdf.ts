// @ts-nocheck
// Ocultando erros TypeScript para bibliotecas globais html2canvas e jspdf
import { NotificationType, GeneratePdfParams } from '../types'; // Import GeneratePdfParams for type usage

const DEFAULT_NO_DATA_MESSAGE = "Não há nenhuma informação cadastrada para exibição.";

export const generatePdfFromElement = async (params: GeneratePdfParams): Promise<boolean> => {
  const {
    elementId,
    pdfFileName,
    pdfTitle,
    checkIsEmpty,
    addNotification, // Destructure addNotification
    noDataMessage = DEFAULT_NO_DATA_MESSAGE,
    onStart,
    onFinish,
  } = params;

  if (onStart) onStart();

  let jsPDFConstructor: any = null;

  if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF === 'function') {
    jsPDFConstructor = window.jspdf.jsPDF;
  } 
  else if (typeof window.jsPDF === 'function') { 
    jsPDFConstructor = window.jsPDF;
    console.warn("jsPDF foi encontrado em window.jsPDF. O esperado para a versão 2.5.1 é window.jspdf.jsPDF. Usando fallback.");
  }

  if (!jsPDFConstructor) {
    const errorMsg = "Erro Crítico: A biblioteca para gerar PDF (jsPDF) não foi carregada. Verifique sua conexão ou extensões de navegador.";
    console.error(errorMsg);
    addNotification(errorMsg, 'error', 10000); // Use addNotification
    if (onFinish) onFinish(false);
    return false;
  }

  if (typeof window.html2canvas === 'undefined') {
    const errorMsg = "Erro Crítico: A biblioteca para capturar a tela (html2canvas) não foi carregada. Verifique sua conexão ou extensões.";
    console.error(errorMsg);
    addNotification(errorMsg, 'error', 10000); // Use addNotification
    if (onFinish) onFinish(false);
    return false;
  }

  try {
    const pdf = new jsPDFConstructor({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; 

    if (checkIsEmpty()) {
      pdf.setFontSize(16);
      pdf.text(pdfTitle, pdfWidth / 2, margin + 10, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(noDataMessage, pdfWidth / 2, pdfHeight / 2, { align: 'center', maxWidth: pdfWidth - 2 * margin });
      pdf.save(pdfFileName);
      if (onFinish) onFinish(true);
      return true;
    }

    const elementToCapture = document.getElementById(elementId);
    if (!elementToCapture) {
      const errorMsg = `Erro ao gerar PDF: Elemento para impressão não encontrado (ID: ${elementId}).`;
      console.error(errorMsg);
      addNotification(errorMsg, 'error'); // Use addNotification
      if (onFinish) onFinish(false);
      return false;
    }

    const canvas = await window.html2canvas(elementToCapture, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff', 
      onclone: (documentClone) => {},
    });
    
    const contentWidth = pdfWidth - 2 * margin;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    let positionCanvas = 0; 
    let pageCount = 0;
    const titleAreaHeightMm = 15; 

    while (positionCanvas < canvasHeight) {
      pageCount++;
      if (pageCount > 1) {
        pdf.addPage();
      }

      let yOnPdfPage = margin;
      if (pageCount === 1) {
        pdf.setFontSize(16);
        pdf.text(pdfTitle, pdfWidth / 2, yOnPdfPage + 5, { align: 'center' });
        yOnPdfPage += titleAreaHeightMm;
      }
      
      const currentPdfPageContentHeightMm = pdfHeight - margin - yOnPdfPage;
      const pixelsPerMmAtContentWidth = canvasWidth / contentWidth;
      let sliceHeightCanvas = Math.min(
        canvasHeight - positionCanvas, 
        currentPdfPageContentHeightMm * pixelsPerMmAtContentWidth 
      );
      
      if (sliceHeightCanvas <= 0 && (canvasHeight - positionCanvas > 0)) { 
          console.warn("Altura da fatia calculada é zero ou negativa, mas o canvas restante. Forçando fatia mínima ou interrompendo.", 
            {sliceHeightCanvas, currentPdfPageContentHeightMm, pixelsPerMmAtContentWidth, positionCanvas, canvasHeight});
          if (canvasHeight - positionCanvas > 1) { 
             sliceHeightCanvas = Math.max(1, canvasHeight - positionCanvas); 
          } else {
            break; 
          }
      } else if (sliceHeightCanvas <= 0) {
        break; 
      }

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvasWidth;
      sliceCanvas.height = sliceHeightCanvas;
      const sliceCtx = sliceCanvas.getContext('2d');
      if (!sliceCtx) {
        throw new Error("Não foi possível obter o contexto 2D do canvas da fatia");
      }

      sliceCtx.drawImage(canvas, 0, positionCanvas, canvasWidth, sliceHeightCanvas, 0, 0, canvasWidth, sliceHeightCanvas);
      
      const sliceImgDataUrl = sliceCanvas.toDataURL('image/png');
      const sliceImgHeightPdfMm = (sliceHeightCanvas * contentWidth) / canvasWidth;

      pdf.addImage(sliceImgDataUrl, 'PNG', margin, yOnPdfPage, contentWidth, sliceImgHeightPdfMm);
      positionCanvas += sliceHeightCanvas;
    }

    pdf.save(pdfFileName);
    if (onFinish) onFinish(true);
    return true;

  } catch (error: any) {
    const errorMsg = `Ocorreu um erro durante a geração do PDF: ${error.message || error.toString()}`;
    console.error("Erro durante o processo de geração do PDF:", error);
    addNotification(errorMsg, 'error', 10000); // Use addNotification
    if (onFinish) onFinish(false);
    return false;
  }
};
