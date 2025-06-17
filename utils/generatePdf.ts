
// @ts-nocheck
// Ocultando erros TypeScript para bibliotecas globais html2canvas e jspdf

interface GeneratePdfParams {
  elementId: string;
  pdfFileName: string;
  pdfTitle: string;
  checkIsEmpty: () => boolean;
  noDataMessage?: string;
  onStart?: () => void;
  onFinish?: (success: boolean) => void;
}

const DEFAULT_NO_DATA_MESSAGE = "Não há nenhuma informação cadastrada para exibição.";

export const generatePdfFromElement = async (params: GeneratePdfParams): Promise<boolean> => {
  const {
    elementId,
    pdfFileName,
    pdfTitle,
    checkIsEmpty,
    noDataMessage = DEFAULT_NO_DATA_MESSAGE,
    onStart,
    onFinish,
  } = params;

  if (onStart) onStart();

  let jsPDFConstructor: any = null;

  // Primary check for jsPDF v2.x UMD (e.g., v2.5.1 as used)
  if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF === 'function') {
    jsPDFConstructor = window.jspdf.jsPDF;
  } 
  // Fallback check (e.g., for jsPDF v1.x or other UMD configurations)
  else if (typeof window.jsPDF === 'function') { 
    jsPDFConstructor = window.jsPDF;
    console.warn("jsPDF foi encontrado em window.jsPDF. O esperado para a versão 2.5.1 é window.jspdf.jsPDF. Usando fallback.");
  }

  // Verifica se a biblioteca jsPDF está carregada
  if (!jsPDFConstructor) {
    console.error("A biblioteca jsPDF (nem em window.jspdf.jsPDF nem em window.jsPDF) não está disponível. Certifique-se de que ela foi carregada do CDN.");
    alert("Erro Crítico: A biblioteca para gerar PDF (jsPDF) não foi carregada corretamente. Verifique sua conexão com a internet ou se há extensões de navegador bloqueando scripts. A funcionalidade de impressão não pode continuar.");
    if (onFinish) onFinish(false);
    return false;
  }

  // Verifica se a biblioteca html2canvas está carregada
  if (typeof window.html2canvas === 'undefined') {
    console.error("A biblioteca html2canvas não está disponível em window.html2canvas. Certifique-se de que ela foi carregada do CDN.");
    alert("Erro Crítico: A biblioteca para capturar a tela (html2canvas) não foi carregada corretamente. Verifique sua conexão ou extensões. A funcionalidade de impressão não pode continuar.");
    if (onFinish) onFinish(false);
    return false;
  }

  try {
    const pdf = new jsPDFConstructor({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // margem de 10mm

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
      console.error(`Elemento com ID '${elementId}' não encontrado.`);
      alert(`Erro ao gerar PDF: Elemento para impressão não encontrado (${elementId}).`);
      if (onFinish) onFinish(false);
      return false;
    }

    const canvas = await window.html2canvas(elementToCapture, {
      scale: 2, // Melhora a qualidade da imagem
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff', // Garante que o fundo seja branco para o canvas
      onclone: (documentClone) => {
        // Opcional: Você pode adicionar manipulações de clonagem específicas aqui, se necessário
      }
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

  } catch (error) {
    console.error("Erro durante o processo de geração do PDF:", error);
    alert("Ocorreu um erro durante a geração do PDF. Verifique o console para mais detalhes.");
    if (onFinish) onFinish(false);
    return false;
  }
};
