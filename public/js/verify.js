/**
 * Elevatifier Verification Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const searchForm = document.getElementById('verifySearchForm');
  const searchInput = document.getElementById('searchInput');
  const verifyLoading = document.getElementById('verifyLoading');
  const verifyNotFound = document.getElementById('verifyNotFound');
  const notFoundMessage = document.getElementById('notFoundMessage');
  const verifyResultCard = document.getElementById('verifyResultCard');

  // Metadata Fields
  const resStudentName = document.getElementById('resStudentName');
  const resCertId = document.getElementById('resCertId');
  const resDomain = document.getElementById('resDomain');
  const resDuration = document.getElementById('resDuration');
  const resCollege = document.getElementById('resCollege');
  const resIssueDate = document.getElementById('resIssueDate');
  const verifyCanvas = document.getElementById('verifyCanvas');
  const btnDownload = document.getElementById('btnDownloadFromVerify');

  let currentCert = null;

  // Extract ID from path: /verify/:id
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  let initialId = null;
  if (pathParts.length >= 2 && pathParts[0].toLowerCase() === 'verify') {
    initialId = pathParts[1];
  } else {
    // Check query param ?id=...
    const urlParams = new URLSearchParams(window.location.search);
    initialId = urlParams.get('id');
  }

  if (initialId) {
    searchInput.value = initialId.trim();
    loadCertificate(initialId.trim());
  }

  // Handle Search Submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = searchInput.value.trim();
    if (id) {
      window.history.pushState(null, '', `/verify/${id}`);
      loadCertificate(id);
    }
  });

  async function loadCertificate(id) {
    verifyLoading.style.display = 'block';
    verifyNotFound.style.display = 'none';
    verifyResultCard.style.display = 'none';

    try {
      const res = await fetch(`/api/certificate/${encodeURIComponent(id)}`);
      const data = await res.json();

      verifyLoading.style.display = 'none';

      if (!res.ok || !data.success || !data.certificate) {
        notFoundMessage.textContent = data.message || `No certificate was found matching ID "${id}".`;
        verifyNotFound.style.display = 'block';
        return;
      }

      currentCert = data.certificate;

      // Populate Details
      resStudentName.textContent = currentCert.studentName || '-';
      resCertId.textContent = currentCert.certificateId || '-';
      resDomain.textContent = currentCert.domain || '-';
      resDuration.textContent = currentCert.duration || '-';
      
      let collegeText = currentCert.college || '';
      if (currentCert.degree) {
        collegeText = `${currentCert.degree}, ${collegeText}`;
      }
      resCollege.textContent = collegeText || 'Accredited Institute';
      resIssueDate.textContent = currentCert.issueDate || '-';

      // Render Canvas
      await window.CertificateRenderer.render(verifyCanvas, currentCert);

      verifyResultCard.style.display = 'block';

    } catch (err) {
      console.error('Failed to verify certificate:', err);
      verifyLoading.style.display = 'none';
      notFoundMessage.textContent = 'A network error occurred while querying the verification registry.';
      verifyNotFound.style.display = 'block';
    }
  }

  // Download high-resolution PNG image
  btnDownload.addEventListener('click', () => {
    if (!currentCert) return;
    const filename = `Elevatifier_Internship_Certificate_${currentCert.certificateId}.png`;
    window.CertificateRenderer.downloadAsImage(verifyCanvas, filename);
  });
});
