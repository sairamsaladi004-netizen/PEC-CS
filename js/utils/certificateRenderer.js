export async function renderCertificate(element, options = {}) {
  const { action = 'download', scale = 3.0, filename = 'certificate.png' } = options;

  if (!element) {
    console.error("No element provided to renderCertificate");
    return;
  }

  if (!window.html2canvas) {
    console.error("html2canvas library is not loaded.");
    alert("html2canvas library is not loaded. Please ensure you have internet access and reload.");
    return;
  }

  try {
    const canvas = await window.html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null
    });

    if (action === 'download') {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Error rendering or downloading certificate:", error);
    alert("Failed to render certificate as image: " + error.message);
  }
}
