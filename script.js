/* ==========================================================================
   PBRU CS BOOTCAMP - INTERACTIVE SCRIPT
   Faculty of Information Technology | Phetchaburi Rajabhat University
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar on Scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // 2. Terminal Code Switcher
  const terminalTabs = document.querySelectorAll('.terminal-tab');
  const codeDisplay = document.getElementById('code-display');

  const codeSnippets = {
    cpp: `<span class="code-comment">// PBRU CS Bootcamp - C++ Fundamentals</span>
<span class="code-keyword">#include</span> &lt;iostream&gt;
<span class="code-keyword">using namespace</span> std;

<span class="code-keyword">int</span> <span class="code-function">main</span>() {
    <span class="code-class">string</span> student = <span class="code-string">"PBRU CS Student"</span>;
    cout &lt;&lt; <span class="code-string">"Welcome to PBRU CS Bootcamp 2026!"</span> &lt;&lt; endl;
    cout &lt;&lt; <span class="code-string">"Future Software Engineer: "</span> &lt;&lt; student &lt;&lt; endl;
    <span class="code-keyword">return</span> <span class="code-string">0</span>;
}`,
    python: `<span class="code-comment"># PBRU CS Bootcamp - Data & AI Track</span>
<span class="code-keyword">def</span> <span class="code-function">welcome_innovator</span>(name, track):
    print(<span class="code-string">f"Hello {name}, welcome to {track} at PBRU IT!"</span>)

<span class="code-comment"># Initialize Student Profile</span>
student = {
    <span class="code-string">"faculty"</span>: <span class="code-string">"Information Technology"</span>,
    <span class="code-string">"major"</span>: <span class="code-string">"Computer Science"</span>,
    <span class="code-string">"status"</span>: <span class="code-string">"Ready to Code"</span>
}

welcome_innovator(student[<span class="code-string">"major"</span>], <span class="code-string">"CS Bootcamp"</span>)`,
    js: `<span class="code-comment">// PBRU CS Bootcamp - Full-Stack Web App</span>
<span class="code-keyword">const</span> pbruBootcamp = {
  university: <span class="code-string">"Phetchaburi Rajabhat University"</span>,
  faculty: <span class="code-string">"Faculty of IT"</span>,
  skills: [<span class="code-string">"Web Architecture"</span>, <span class="code-string">"React/Node"</span>, <span class="code-string">"AI Integration"</span>],
  launchCareer: () => <span class="code-string">"Software Developer & Innovator 🚀"</span>
};

console.log(pbruBootcamp.launchCareer());`
  };

  terminalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      terminalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const lang = tab.getAttribute('data-lang');
      if (codeDisplay && codeSnippets[lang]) {
        codeDisplay.innerHTML = codeSnippets[lang];
      }
    });
  });

  // 3. Learning Tracks Tab Switcher
  const trackBtns = document.querySelectorAll('.track-btn');
  const trackContents = document.querySelectorAll('.track-content');

  trackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      trackBtns.forEach(b => b.classList.remove('active'));
      trackContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTrack = btn.getAttribute('data-track');
      const activeContent = document.getElementById(`track-${targetTrack}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });

  // 4. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 5. Registration Modal & Toast
  const registerBtns = document.querySelectorAll('.btn-register-trigger');
  const modalOverlay = document.getElementById('register-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const registerForm = document.getElementById('register-form');
  const toast = document.getElementById('success-toast');

  // Open Modal
  registerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay?.classList.add('active');
    });
  });

  // Close Modal
  modalCloseBtn?.addEventListener('click', () => {
    modalOverlay?.classList.remove('active');
  });

  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  // Submit Form
  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname')?.value;
    const email = document.getElementById('email')?.value;
    const phone = document.getElementById('phone')?.value;
    const track = document.getElementById('selected-track')?.value;

    if (!fullname || !email || !phone) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนส่งใบสมัครครับ');
      return;
    }

    // Save to localStorage simulation
    const registrationData = {
      fullname,
      email,
      phone,
      track,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`pbru_cs_reg_${Date.now()}`, JSON.stringify(registrationData));

    // Hide Modal & Reset
    modalOverlay?.classList.remove('active');
    registerForm.reset();

    // Show Toast
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  mobileToggle?.addEventListener('click', () => {
    if (navLinks.style.display === 'flex') {
      navLinks.style.display = 'none';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = '#090E1F';
      navLinks.style.padding = '20px';
      navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    }
  });
});
