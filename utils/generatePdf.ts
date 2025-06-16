
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

  // Verifica se a biblioteca jsPDF está carregada
  if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
    console.error("A biblioteca jsPDF não está disponível em window.jspdf.jsPDF. Certifique-se de que ela foi carregada do CDN.");
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
    const { jsPDF } = window.jspdf; // Deve ser seguro agora
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
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
    
    // Calcula a altura da imagem em unidades PDF (mm) mantendo a proporção
    // const imgTotalHeightMm = (canvasHeight * contentWidth) / canvasWidth; // Não usado diretamente para fatiar

    let positionCanvas = 0; // Rastreia a posição y no *canvas de origem* em pixels
    let pageCount = 0;
    const titleAreaHeightMm = 15; // Altura aproximada para o título e sua margem superior

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
      
      // Altura efetiva da página para conteúdo nesta página PDF (em mm)
      const currentPdfPageContentHeightMm = pdfHeight - margin - yOnPdfPage;
      
      // Calcula quanto da altura do canvas (em pixels) cabe na altura de conteúdo disponível da página PDF atual
      const pixelsPerMmAtContentWidth = canvasWidth / contentWidth;
      let sliceHeightCanvas = Math.min(
        canvasHeight - positionCanvas, // Altura restante do canvas
        currentPdfPageContentHeightMm * pixelsPerMmAtContentWidth // Altura máxima de conteúdo para esta página em pixels do canvas
      );
      
      if (sliceHeightCanvas <= 0 && (canvasHeight - positionCanvas > 0)) { 
          console.warn("Altura da fatia calculada é zero ou negativa, mas o canvas restante. Forçando fatia mínima ou interrompendo.", 
            {sliceHeightCanvas, currentPdfPageContentHeightMm, pixelsPerMmAtContentWidth, positionCanvas, canvasHeight});
          // Isso pode indicar um problema com conteúdo restante extremamente pequeno ou altura de página muito pequena.
          // Forçando uma pequena fatia se o conteúdo permanecer, ou interrompendo se for realmente problemático.
          if (canvasHeight - positionCanvas > 1) { // Se mais de 1 pixel permanecer
             sliceHeightCanvas = Math.max(1, canvasHeight - positionCanvas); // Pega pelo menos 1 pixel ou o que resta
          } else {
            break; 
          }
      } else if (sliceHeightCanvas <= 0) {
        break; // Sem mais conteúdo ou sem espaço
      }


      // Cria um canvas temporário para a fatia atual
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvasWidth;
      sliceCanvas.height = sliceHeightCanvas;
      const sliceCtx = sliceCanvas.getContext('2d');
      if (!sliceCtx) {
        throw new Error("Não foi possível obter o contexto 2D do canvas da fatia");
      }

      // Desenha a fatia do canvas principal para o canvas temporário
      sliceCtx.drawImage(canvas, 0, positionCanvas, canvasWidth, sliceHeightCanvas, 0, 0, canvasWidth, sliceHeightCanvas);
      
      const sliceImgDataUrl = sliceCanvas.toDataURL('image/png');
      // Calcula a altura desta fatia como ela será renderizada no PDF (em mm)
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