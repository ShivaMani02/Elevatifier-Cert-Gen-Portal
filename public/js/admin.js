/**
 * Elevatifier Admin Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const adminAuthSection = document.getElementById('adminAuthSection');
  const adminPanelSection = document.getElementById('adminPanelSection');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminSecretInput = document.getElementById('adminSecretInput');
  const authErrorMsg = document.getElementById('authErrorMsg');

  const statTotalCerts = document.getElementById('statTotalCerts');
  const statFreeGrants = document.getElementById('statFreeGrants');
  const statPaidOrders = document.getElementById('statPaidOrders');

  const adminFreeIssueForm = document.getElementById('adminFreeIssueForm');
  const btnAdminIssue = document.getElementById('btnAdminIssue');
  const adminTableBody = document.getElementById('adminTableBody');
  const btnRefreshList = document.getElementById('btnRefreshList');
  const adminExportCanvas = document.getElementById('adminExportCanvas');

  let activeSecret = sessionStorage.getItem('elv_admin_secret') || '';

  if (activeSecret) {
    loadDashboard(activeSecret);
  }

  // Admin Login Handler
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const secret = adminSecretInput.value.trim();
    if (!secret) return;

    authErrorMsg.style.display = 'none';
    const success = await loadDashboard(secret);
    if (!success) {
      authErrorMsg.textContent = 'Invalid Admin Secret Key. Please check your .env or Render configuration.';
      authErrorMsg.style.display = 'block';
    }
  });

  async function loadDashboard(secret) {
    try {
      const res = await fetch('/api/admin/certificates', {
        headers: { 'x-admin-secret': secret }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return false;
      }

      // Save valid secret in session
      activeSecret = secret;
      sessionStorage.setItem('elv_admin_secret', secret);

      // Show panel, hide login
      adminAuthSection.style.display = 'none';
      adminPanelSection.style.display = 'block';

      allLoadedCertificates = data.certificates || [];
      renderCertificatesList(allLoadedCertificates);
      return true;
    } catch (err) {
      console.error('Failed to authenticate admin:', err);
      return false;
    }
  }

  let allLoadedCertificates = [];

  // Search Filter Handler
  const adminSearchInput = document.getElementById('adminSearchInput');
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderCertificatesList(allLoadedCertificates);
        return;
      }
      const filtered = allLoadedCertificates.filter(c => 
        (c.certificateId && c.certificateId.toLowerCase().includes(q)) ||
        (c.studentName && c.studentName.toLowerCase().includes(q)) ||
        (c.domain && c.domain.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.college && c.college.toLowerCase().includes(q))
      );
      renderCertificatesList(filtered);
    });
  }

  // Logout / Lock Session
  const btnAdminLogout = document.getElementById('btnAdminLogout');
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      sessionStorage.removeItem('elv_admin_secret');
      activeSecret = '';
      adminPanelSection.style.display = 'none';
      adminAuthSection.style.display = 'block';
      adminSecretInput.value = '';
    });
  }

  // Render Certificates in Table & Update Stats
  function renderCertificatesList(list) {
    statTotalCerts.textContent = allLoadedCertificates.length;
    const freeCount = allLoadedCertificates.filter(c => c.amount === 0 || c.razorpayOrderId?.startsWith('admin_')).length;
    statFreeGrants.textContent = freeCount;
    statPaidOrders.textContent = allLoadedCertificates.length - freeCount;

    if (list.length === 0) {
      adminTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
            No matching certificates found.
          </td>
        </tr>
      `;
      return;
    }

    adminTableBody.innerHTML = list.map(c => {
      const isFree = c.amount === 0 || c.razorpayOrderId?.startsWith('admin_');
      const badge = isFree ? '<span class="badge-free">Admin Grant (₹0)</span>' : '<span class="badge-paid">Paid ₹399</span>';
      return `
        <tr>
          <td style="font-family: monospace; font-weight: 700; color: var(--accent-cyan);">${c.certificateId}</td>
          <td style="font-weight: 600; color: #fff;">${c.studentName}</td>
          <td>${c.domain}</td>
          <td><strong style="color: #cbd5e1;">${c.duration}</strong></td>
          <td>${badge}</td>
          <td style="font-size: 12px;">${c.issueDate}</td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button onclick="downloadCertById('${c.certificateId}')" class="btn-copy" style="background: rgba(212, 175, 55, 0.15); color: var(--text-gold); border-color: rgba(212, 175, 55, 0.3); padding: 5px 10px; font-size: 11.5px;">
                <i class="fa-solid fa-download"></i> PNG
              </button>
              <a href="/verify/${c.certificateId}" target="_blank" class="btn-copy" style="text-decoration: none; padding: 5px 10px; font-size: 11.5px;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Verify
              </a>
              <button onclick="copyVerifyUrl('${c.certificateId}', this)" class="btn-copy" style="padding: 5px 10px; font-size: 11.5px;" title="Copy public verification URL">
                <i class="fa-solid fa-link"></i> Link
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Refresh Table
  btnRefreshList.addEventListener('click', () => {
    if (activeSecret) loadDashboard(activeSecret);
  });

  // Issue Free Certificate Handler
  adminFreeIssueForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentData = {
      studentName: document.getElementById('admStudentName').value.trim(),
      email: document.getElementById('admEmail').value.trim(),
      mobile: document.getElementById('admMobile').value.trim(),
      college: document.getElementById('admCollege').value.trim(),
      degree: document.getElementById('admDegree').value.trim(),
      domain: document.getElementById('admDomain').value,
      duration: document.getElementById('admDuration').value,
      issueDate: document.getElementById('admIssueDate').value.trim() || undefined
    };

    btnAdminIssue.disabled = true;
    btnAdminIssue.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating & Sealing Certificate...';

    try {
      const res = await fetch('/api/admin/issue-free-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: activeSecret,
          studentData
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to issue certificate.');
      }

      alert(`✅ Certificate ${data.certificate.certificateId} successfully issued for ${studentData.studentName}! Downloading PNG now...`);

      // Render on hidden canvas & auto download
      await window.CertificateRenderer.render(adminExportCanvas, data.certificate);
      window.CertificateRenderer.downloadAsImage(adminExportCanvas, `Elevatifier_Certificate_${data.certificate.certificateId}.png`);

      // Reset form & reload list
      adminFreeIssueForm.reset();
      loadDashboard(activeSecret);

    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      btnAdminIssue.disabled = false;
      btnAdminIssue.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> Issue Verified Certificate (Free ₹0)';
    }
  });

  // Global helper for row actions
  window.downloadCertById = async function (id) {
    try {
      const res = await fetch(`/api/certificate/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!data.success || !data.certificate) {
        alert('Could not retrieve certificate data.');
        return;
      }
      await window.CertificateRenderer.render(adminExportCanvas, data.certificate);
      window.CertificateRenderer.downloadAsImage(adminExportCanvas, `Elevatifier_Certificate_${data.certificate.certificateId}.png`);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  // Global helper to copy verification URL
  window.copyVerifyUrl = function (id, btn) {
    const url = `${window.location.origin}/verify/${encodeURIComponent(id)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        btn.style.color = '#10b981';
        btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      }).catch(() => {
        prompt('Copy this verification URL:', url);
      });
    } else {
      prompt('Copy this verification URL:', url);
    }
  };
});
