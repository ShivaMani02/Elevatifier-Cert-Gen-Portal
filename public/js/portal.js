/**
 * Elevatifier Certificate Portal Controller
 * Strictly for student registrations & Razorpay payments (₹399)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const form = document.getElementById('certificateForm');
  const studentNameInput = document.getElementById('studentName');
  const studentEmailInput = document.getElementById('studentEmail');
  const studentMobileInput = document.getElementById('studentMobile');
  const collegeNameInput = document.getElementById('collegeName');
  const degreeCourseInput = document.getElementById('degreeCourse');
  const internDomainSelect = document.getElementById('internDomain');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const btnPay = document.getElementById('btnPayAndGenerate');
  const btnPayText = document.getElementById('btnPayText');

  // Preview Elements
  const prevStudentName = document.getElementById('prevStudentName');
  const prevCollege = document.getElementById('prevCollege');
  const prevDuration = document.getElementById('prevDuration');
  const prevDomain = document.getElementById('prevDomain');
  const prevTenureDates = document.getElementById('prevTenureDates');

  // Modal Elements
  const successModal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalStudentName = document.getElementById('modalStudentName');
  const modalCertId = document.getElementById('modalCertId');
  const certificateCanvas = document.getElementById('certificateCanvas');
  const btnDownloadImage = document.getElementById('btnDownloadImage');
  const btnViewVerification = document.getElementById('btnViewVerification');
  const verificationLinkInput = document.getElementById('verificationLinkInput');
  const btnCopyVerificationLink = document.getElementById('btnCopyVerificationLink');

  let currentIssuedCert = null;
  let serverConfig = { test_mode: true, key_id: null, amount: 399 };

  // Fetch Public Server Config
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      serverConfig = await res.json();
    }
  } catch (err) {
    console.warn('Could not load server config:', err);
  }

  // Set default sensible dates based on duration
  function setDefaultDates(durationMonths) {
    const today = new Date();
    const start = new Date(today);
    start.setMonth(today.getMonth() - durationMonths);

    startDateInput.value = start.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];
    updatePreview();
  }

  // Initial duration setup (3 Months default)
  setDefaultDates(3);

  // Duration Radio Listeners (3 Months, 6 Months, 9 Months)
  const durationRadios = document.querySelectorAll('input[name="durationOption"]');
  durationRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = e.target.value;
      const months = parseInt(val, 10) || 3;
      setDefaultDates(months);
    });
  });

  // Live Preview Updater
  function updatePreview() {
    const name = studentNameInput.value.trim() || 'YOUR NAME HERE';
    const college = collegeNameInput.value.trim();
    const degree = degreeCourseInput.value.trim();
    const domain = internDomainSelect.value || 'Full Stack Web Development';
    const duration = document.querySelector('input[name="durationOption"]:checked')?.value || '3 Months';
    
    prevStudentName.textContent = name.toUpperCase();

    if (college && degree) {
      prevCollege.textContent = `of ${degree}, ${college}`;
    } else if (college) {
      prevCollege.textContent = `of ${college}`;
    } else {
      prevCollege.textContent = 'of Your University / College';
    }

    prevDuration.textContent = duration;
    prevDomain.textContent = domain;

    if (startDateInput.value && endDateInput.value) {
      prevTenureDates.textContent = `${formatDate(startDateInput.value)} - ${formatDate(endDateInput.value)}`;
    } else {
      prevTenureDates.textContent = duration;
    }
  }

  function formatDate(dStr) {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  }

  // Listen to input changes for real-time preview
  [studentNameInput, collegeNameInput, degreeCourseInput, internDomainSelect, startDateInput, endDateInput]
    .forEach(el => el.addEventListener('input', updatePreview));

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedDuration = document.querySelector('input[name="durationOption"]:checked')?.value;
    if (!selectedDuration) {
      alert('Please select an internship duration.');
      return;
    }

    // Build payload
    const studentData = {
      studentName: studentNameInput.value.trim(),
      email: studentEmailInput.value.trim(),
      mobile: studentMobileInput.value.trim(),
      college: collegeNameInput.value.trim(),
      degree: degreeCourseInput.value.trim(),
      domain: internDomainSelect.value,
      duration: selectedDuration,
      startDate: formatDate(startDateInput.value),
      endDate: formatDate(endDateInput.value),
      issueDate: formatDate(new Date().toISOString().split('T')[0])
    };

    // UI Loading state
    btnPay.disabled = true;
    const originalBtnText = btnPayText.textContent;
    btnPayText.textContent = 'Initializing Secure Payment...';

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to initiate order.');
      }

      // 2. Launch Razorpay or Test Mode Checkout
      if (orderData.test_mode || !window.Razorpay) {
        // Sandbox Simulation Mode (Non-blocking)
        btnPayText.textContent = 'Verifying Payment & Sealing Certificate...';

        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_signature: 'demo_verified_signature',
            studentData
          })
        });

        const verifyResult = await verifyRes.json();
        if (!verifyResult.success) {
          throw new Error(verifyResult.message || 'Verification failed.');
        }

        await displayIssuedCertificate(verifyResult.certificate);

      } else {
        // Live Razorpay Checkout Modal
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Elevatifier Technologies',
          description: `Internship Certificate - ${studentData.domain}`,
          order_id: orderData.order_id,
          prefill: {
            name: studentData.studentName,
            email: studentData.email,
            contact: studentData.mobile
          },
          theme: {
            color: '#0b1329'
          },
          handler: async function (response) {
            btnPayText.textContent = 'Finalizing & Sealing Certificate...';

            try {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  studentData
                })
              });

              const verifyResult = await verifyRes.json();
              if (!verifyResult.success) {
                throw new Error(verifyResult.message || 'Payment verification failed.');
              }

              await displayIssuedCertificate(verifyResult.certificate);
            } catch (err) {
              alert('Verification Error: ' + err.message);
              btnPay.disabled = false;
              btnPayText.textContent = originalBtnText;
            }
          },
          modal: {
            ondismiss: function () {
              btnPay.disabled = false;
              btnPayText.textContent = originalBtnText;
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (err) {
      alert('Notice: ' + err.message);
      btnPay.disabled = false;
      btnPayText.textContent = originalBtnText;
    }
  });

  // Display Issued Certificate in Modal & Render Canvas
  async function displayIssuedCertificate(cert) {
    currentIssuedCert = cert;

    modalStudentName.textContent = cert.studentName;
    modalCertId.textContent = cert.certificateId;
    verificationLinkInput.value = cert.verificationUrl;
    btnViewVerification.href = `/verify/${cert.certificateId}`;

    // Render Canvas at 3000 x 2121 px
    await window.CertificateRenderer.render(certificateCanvas, cert);

    // Open Modal
    successModal.classList.add('active');

    // Reset button
    btnPay.disabled = false;
    btnPayText.textContent = 'Certificate Issued Successfully';
  }

  // Download Certificate Image Action (Direct to Gallery/Downloads)
  btnDownloadImage.addEventListener('click', () => {
    if (!currentIssuedCert) return;
    const filename = `Elevatifier_Internship_Certificate_${currentIssuedCert.certificateId}.png`;
    window.CertificateRenderer.downloadAsImage(certificateCanvas, filename);
  });

  // Copy Verification Link
  btnCopyVerificationLink.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(verificationLinkInput.value);
      btnCopyVerificationLink.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        btnCopyVerificationLink.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Link';
      }, 2500);
    } catch {
      verificationLinkInput.select();
      document.execCommand('copy');
      btnCopyVerificationLink.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    }
  });

  // Close Modal
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });
  }

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
      }
    });
  }

  // FAQ Accordion Interaction
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const parentItem = question.closest('.faq-item');
      if (parentItem) {
        parentItem.classList.toggle('active');
      }
    });
  });
});
