import { useState, useEffect } from 'react';
import './App.css';

const SECTIONS = [
  { id: 'intro', label: 'Overview' },
  { id: 'step-find-config', label: '1. Find Limine Config' },
  { id: 'step-add-windows', label: '2. Add Windows to Menu' },
  { id: 'step-boot-order', label: '3. Set UEFI Boot Priority' },
  { id: 'step-timeout', label: '4. Set 10s Boot Timeout' },
  { id: 'step-reboot', label: '5. Verify & Reboot' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'quick-checklist', label: 'Quick Copy-Paste Checklist' },
  { id: 'target-result', label: 'Target Result' },
  { id: 'references', label: 'Official References' },
];

const TRACKABLE_STEPS = [
  { id: 'step-1', title: '1. Find Limine Config' },
  { id: 'step-2', title: '2. Add Windows to Menu' },
  { id: 'step-3', title: '3. Set UEFI Boot Priority' },
  { id: 'step-4', title: '4. Set 10-Second Timeout' },
  { id: 'step-5', title: '5. Verify & Reboot' },
];

const FULL_CHECKLIST_SCRIPT = `# 1. Find Limine config
sudo find /boot -name 'limine.conf' -print

# 2. Scan for Windows
sudo limine-scan

# If unavailable:
# sudo limine-entry-tool --scan

# 3. Verify Windows entry
sudo grep -i -A8 "Windows" /boot/limine.conf

# 4. Check UEFI boot order
sudo efibootmgr

# 5. Set Limine first
# Replace IDs with the IDs from your laptop:
sudo efibootmgr -o <LIMINE_ID>,<WINDOWS_ID>,<OTHER_IDS>

# 6. Edit Limine configuration
sudo nano /boot/limine.conf

# Set:
# timeout: 10

# 7. Verify timeout
sudo grep -i "timeout" /boot/limine.conf

# 8. Reboot
sudo reboot`;

function CodeBlock({ code, language = 'bash', title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{title || language}</span>
        <button className="copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? (
            <>
              <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="code-block-content">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState('intro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  
  // Progress tracker state using localStorage
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('omarchy_boot_menu_completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('omarchy_boot_menu_completed', JSON.stringify(completedSteps));
    } catch {
      // ignore
    }
  }, [completedSteps]);

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / TRACKABLE_STEPS.length) * 100);

  // Scrollspy observer
  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const copyFullScript = () => {
    navigator.clipboard.writeText(FULL_CHECKLIST_SCRIPT);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2500);
  };

  return (
    <div className="app-container">
      {/* Top Navbar / Mobile Header */}
      <header className="top-nav">
        <div className="nav-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 32 32" fill="none" className="nav-logo-svg">
              <rect width="32" height="32" rx="8" fill="#161b22"/>
              <rect x="1" y="1" width="30" height="30" rx="7" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5"/>
              <path d="M7 10L12 14L7 18" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="14" y1="18" x2="22" y2="18" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"/>
              <rect x="7" y="22" width="18" height="3" rx="1.5" fill="#34d399"/>
            </svg>
          </div>
          <div className="brand-text-group">
            <span className="brand-badge">BOOT MENU GUIDE</span>
            <span className="brand-title">Limine Boot Menu Setup</span>
          </div>
        </div>
        
        <div className="nav-right">
          <div className="mini-progress" title={`${progressPercent}% completed`}>
            <div className="mini-progress-bar" style={{ width: `${progressPercent}%` }}></div>
            <span className="mini-progress-text">{completedCount}/{TRACKABLE_STEPS.length} Steps</span>
          </div>

          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      <div className="layout-body">
        {/* Sidebar Navigation */}
        <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Table of Contents</h3>
            <span className="toc-subtitle">Configure Boot Menu</span>
          </div>

          <nav className="toc-nav">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                className={`toc-link ${activeSection === sec.id ? 'active' : ''}`}
                onClick={() => scrollToSection(sec.id)}
              >
                <span className="toc-bullet"></span>
                <span className="toc-label">{sec.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-progress-card">
            <div className="progress-card-header">
              <span className="progress-card-title">Setup Progress</span>
              <span className="progress-card-percent">{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="progress-status-text">
              {completedCount === TRACKABLE_STEPS.length 
                ? '🎉 Boot Menu configured!' 
                : `${completedCount} of ${TRACKABLE_STEPS.length} steps marked complete`}
            </p>
            {completedCount > 0 && (
              <button 
                className="reset-progress-btn" 
                onClick={() => setCompletedSteps({})}
              >
                Reset Progress
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">

          {/* Section: Intro / Overview */}
          <section id="intro" className="content-card intro-card">
            <div className="hero-header">
              <h1>Default Boot Menu Setup Guide</h1>
              <p className="hero-subtitle">
                Configure your laptop so that when you power on, it automatically shows a <strong>10-second Limine boot menu</strong> allowing you to choose between <strong>Omarchy</strong> and <strong>Windows</strong>.
              </p>
            </div>

            <div className="callout callout-info">
              <div className="callout-icon">💡</div>
              <div className="callout-body">
                <strong>Omarchy is already installed on your system.</strong> Limine is Omarchy's default bootloader. Follow the steps below inside Omarchy to scan for Windows, prioritize Limine in UEFI, and set a 10-second menu timer.
              </div>
            </div>
          </section>

          {/* Step 1: Find Limine Config */}
          <section id="step-find-config" className="content-card step-card">
            <div className="step-header">
              <div className="step-badge-group">
                <span className="step-number">1</span>
                <h2>Find Limine Configuration</h2>
              </div>
              <label className="step-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={!!completedSteps['step-1']} 
                  onChange={() => toggleStep('step-1')} 
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Mark Complete</span>
              </label>
            </div>

            <p>Boot into Omarchy and open a terminal.</p>
            <p className="list-intro">Confirm that Limine is installed in <code>/boot</code>:</p>
            <CodeBlock code="sudo ls /boot" language="bash" />

            <p className="list-intro">Find the location of your <code>limine.conf</code> configuration file:</p>
            <CodeBlock code="sudo find /boot -name 'limine.conf' -print" language="bash" />
          </section>

          {/* Step 2: Add Windows to Boot Menu */}
          <section id="step-add-windows" className="content-card step-card">
            <div className="step-header">
              <div className="step-badge-group">
                <span className="step-number">2</span>
                <h2>Add Windows to the Boot Menu</h2>
              </div>
              <label className="step-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={!!completedSteps['step-2']} 
                  onChange={() => toggleStep('step-2')} 
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Mark Complete</span>
              </label>
            </div>

            <p className="list-intro">Run the scan tool to automatically detect Windows Boot Manager:</p>
            <CodeBlock code="sudo limine-scan" language="bash" />

            <p className="list-intro">Follow the prompts and add:</p>
            <CodeBlock code="Windows Boot Manager" language="text" />

            <p className="list-intro">If <code>limine-scan</code> is unavailable on your system, try:</p>
            <CodeBlock code="sudo limine-entry-tool --scan" language="bash" />

            <p className="list-intro">Verify that the Windows entry was successfully written to your configuration:</p>
            <CodeBlock code="sudo grep -A8 -i &quot;Windows&quot; /boot/limine.conf" language="bash" />
          </section>

          {/* Step 3: Set UEFI Boot Priority */}
          <section id="step-boot-order" className="content-card step-card">
            <div className="step-header">
              <div className="step-badge-group">
                <span className="step-number">3</span>
                <h2>Set UEFI Boot Priority</h2>
              </div>
              <label className="step-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={!!completedSteps['step-3']} 
                  onChange={() => toggleStep('step-3')} 
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Mark Complete</span>
              </label>
            </div>

            <p className="list-intro">Check your current motherboard UEFI boot entries and order:</p>
            <CodeBlock code="sudo efibootmgr" language="bash" />

            <p className="list-intro">You want the Omarchy/Limine boot entry to appear <strong>before Windows Boot Manager</strong> in <code>BootOrder:</code></p>
            <CodeBlock code="BootOrder: 0003,0005,0000,2001,2002,2003" language="text" title="Example efibootmgr output" />

            <p className="list-intro">Where:</p>
            <CodeBlock code={`0003 = Omarchy / Limine\n0005 = Windows Boot Manager`} language="text" />

            <div className="rule-card">
              <pre>{`Golden Rule:\n1. Limine FIRST\n2. Windows SECOND`}</pre>
            </div>

            <p>If Windows is listed first, the laptop motherboard will bypass Limine and boot straight into Windows without showing the selection menu.</p>
            
            <p className="list-intro">Set the boot order using the exact entry IDs shown by <code>sudo efibootmgr</code> on your laptop:</p>
            <CodeBlock code="sudo efibootmgr -o <LIMINE_ID>,<WINDOWS_ID>,<OTHER_IDS>" language="bash" />

            <p className="list-intro">Example:</p>
            <CodeBlock code="sudo efibootmgr -o 0003,0005,0000,2001,2002,2003" language="bash" />

            <div className="callout callout-warning">
              <div className="callout-icon">🚨</div>
              <div className="callout-body">
                <strong>Do not blindly copy example IDs (like 0003 or 0005).</strong> UEFI boot IDs vary across laptop brands and models. Always use the numbers printed by your own <code>sudo efibootmgr</code> output.
              </div>
            </div>
          </section>

          {/* Step 4: Set 10-Second Timeout */}
          <section id="step-timeout" className="content-card step-card">
            <div className="step-header">
              <div className="step-badge-group">
                <span className="step-number">4</span>
                <h2>Set a 10-Second Menu Timeout</h2>
              </div>
              <label className="step-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={!!completedSteps['step-4']} 
                  onChange={() => toggleStep('step-4')} 
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Mark Complete</span>
              </label>
            </div>

            <p className="list-intro">Open your Limine configuration file in a text editor:</p>
            <CodeBlock code="sudo nano /boot/limine.conf" language="bash" />

            <p className="list-intro">Find the <code>timeout:</code> setting and update it to:</p>
            <CodeBlock code="timeout: 10" language="text" />

            <p>This ensures the boot menu stays on screen for <strong>10 seconds</strong> on power-on before automatically booting the default OS.</p>
            <p>If there is no <code>timeout:</code> line present in the file, add <code>timeout: 10</code> near the top of the file.</p>

            <p className="list-intro">Save and exit in Nano editor:</p>
            <div className="key-sequence">
              <kbd>Ctrl</kbd> + <kbd>O</kbd> → <kbd>Enter</kbd> → <kbd>Ctrl</kbd> + <kbd>X</kbd>
            </div>
          </section>

          {/* Step 5: Verify & Reboot */}
          <section id="step-reboot" className="content-card step-card">
            <div className="step-header">
              <div className="step-badge-group">
                <span className="step-number">5</span>
                <h2>Final Verification & Reboot</h2>
              </div>
              <label className="step-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={!!completedSteps['step-5']} 
                  onChange={() => toggleStep('step-5')} 
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Mark Complete</span>
              </label>
            </div>

            <p className="list-intro">1. Confirm UEFI boot order (Limine must be first):</p>
            <CodeBlock code="sudo efibootmgr" language="bash" />

            <p className="list-intro">2. Confirm Windows boot entry exists in Limine:</p>
            <CodeBlock code="sudo grep -i -A8 &quot;Windows&quot; /boot/limine.conf" language="bash" />

            <p className="list-intro">3. Confirm 10-second timeout is active:</p>
            <CodeBlock code="sudo grep -i &quot;timeout&quot; /boot/limine.conf" language="bash" />

            <p className="list-intro">4. Reboot your system to test the boot menu:</p>
            <CodeBlock code="sudo reboot" language="bash" />
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="content-card">
            <div className="section-title-group">
              <span className="section-icon">🔧</span>
              <h2>Troubleshooting</h2>
            </div>

            <div className="trouble-issue">
              <h3>Windows does not appear in menu</h3>
              <p className="list-intro">Run the scanner again:</p>
              <CodeBlock code="sudo limine-scan" language="bash" />

              <p className="list-intro">Then check if it was added:</p>
              <CodeBlock code="sudo grep -i -A8 &quot;Windows&quot; /boot/limine.conf" language="bash" />

              <p>If it still does not appear, verify that your Windows EFI boot partition is accessible:</p>
              <CodeBlock code="lsblk -f" language="bash" />

              <p>Look for a FAT32/vfat partition containing <code>EFI/Microsoft/Boot/bootmgfw.efi</code>.</p>

              <div className="sub-issue">
                <h4>EFI Path Case Sensitivity</h4>
                <p>If Limine complains it cannot find the Windows EFI file, check letter casing in <code>/boot/limine.conf</code>.</p>
                <p>For example, <code>/EFI/MICROSOFT/BOOT/BOOTMGFW.EFI</code> may need to be corrected to <code>/EFI/Microsoft/Boot/bootmgfw.efi</code> depending on filesystem formatting.</p>
              </div>
            </div>

            <div className="trouble-issue">
              <div className="trouble-header">
                <h3>Laptop boots directly into Windows</h3>
                <span className="status-badge-verified">✓ Confirmed Fix</span>
              </div>
              <p className="list-intro">Check UEFI boot order:</p>
              <CodeBlock code="sudo efibootmgr" language="bash" />

              <p>If Windows is listed first in <code>BootOrder:</code> (e.g., <code>BootOrder: 0005,0003,...</code>), change it so Limine is first:</p>
              <CodeBlock code="sudo efibootmgr -o 0003,0005,..." language="bash" />

              <details className="trouble-disclosure" open>
                <summary className="disclosure-summary">Detailed Steps &amp; Confirmed Real-World Fix</summary>
                <div className="disclosure-content">
                  <div className="symptom-box">
                    <strong>SYMPTOM:</strong>
                    <p>
                      "On power-on, no boot menu appears at all — the machine boots straight into Windows. The Limine menu (Omarchy / Windows Boot Manager) only appears if you manually press the firmware boot-selection key (F12, Esc, F10, etc. depending on manufacturer) during POST and choose Limine from that firmware menu by hand."
                    </p>
                  </div>

                  <div className="callout callout-info">
                    <div className="callout-icon">💡</div>
                    <div className="callout-body">
                      <strong>Self-Diagnosis Note:</strong> Distinguish this from a different symptom: <em>"The Limine menu appears automatically, but Windows Boot Manager is the highlighted/default entry."</em> That is a separate issue controlled by Limine's <code>default_entry</code> setting in <code>/boot/limine.conf</code>, not a UEFI BootOrder issue.
                    </div>
                  </div>

                  <div className="root-cause-box">
                    <strong>ROOT CAUSE:</strong>
                    <p>
                      The UEFI firmware's BootOrder has "Windows Boot Manager" listed before the Limine/Linux boot entry. On power-on, firmware loads whatever is first in BootOrder directly — Limine never gets a chance to run unless the user bypasses BootOrder via the firmware's one-time boot menu.
                    </p>
                  </div>

                  <div className="sub-issue">
                    <h4>Confirmed Fix — Step-by-Step</h4>
                    <ol className="step-list">
                      <li>
                        Boot into Omarchy normally (or via the manual firmware boot menu if that's the only way in right now).
                      </li>
                      <li>
                        Open a terminal and run:
                        <CodeBlock code="sudo efibootmgr -v" language="bash" />
                        List every boot entry with its 4-digit ID and label. Identify the ID for the Limine entry (may be labeled "Limine," "Linux Boot Manager," or similar — not always literally "Limine") and the ID for "Windows Boot Manager."
                      </li>
                      <li>
                        In the same output, find the <code>BootOrder:</code> line — a comma-separated list of IDs. Whichever ID is FIRST is what boots by default.
                      </li>
                      <li>
                        Reorder it so the Limine ID comes first:
                        <CodeBlock code="sudo efibootmgr -o <LIMINE_ID>,<WINDOWS_ID>,<rest of original IDs in original order>" language="bash" />
                        Example only — do not let users copy literally:
                        <CodeBlock code="sudo efibootmgr -o 0003,0005,0000,2001" language="bash" />
                      </li>
                      <li>
                        Verify: run <code>sudo efibootmgr</code> again and confirm BootOrder now starts with the Limine ID.
                      </li>
                      <li>
                        Reboot without pressing any boot-selection key:
                        <CodeBlock code="sudo reboot" language="bash" />
                        The Limine menu should now appear automatically.
                      </li>
                    </ol>
                  </div>

                  <div className="callout callout-warning">
                    <div className="callout-icon">⚠️</div>
                    <div className="callout-body">
                      <strong>Important Caveats &amp; Warnings:</strong>
                      <ul className="caveats-list">
                        <li>
                          <strong>Label Variations:</strong> The Limine entry's label varies by system — it is not always literally named "Limine." Tell users to identify it by process of elimination (whichever entry isn't "Windows Boot Manager" and isn't a manufacturer diagnostic/recovery entry).
                        </li>
                        <li>
                          <strong>Silently Reverting / Fast Startup:</strong> On some laptops (notably many Lenovo, HP, and Dell models), the boot order can silently revert to Windows-first after a firmware update or because Windows "Fast Startup" re-registers itself as default. If the fix stops working after a reboot or two, tell users to check Windows Fast Startup (Control Panel &gt; Power Options &gt; Choose what the power buttons do &gt; uncheck "Turn on fast startup") and re-run the <code>efibootmgr -o</code> command if BootOrder reverted.
                        </li>
                        <li>
                          <strong>Secure Boot Errors:</strong> <code>efibootmgr -o</code> failing with a permission or "operation not supported" error usually means Secure Boot is still enabled — point back to the Section 0 BIOS/UEFI prep steps to disable it.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div className="trouble-issue">
              <h3>Boot menu disappears too quickly</h3>
              <p className="list-intro">Check timeout line:</p>
              <CodeBlock code="sudo grep -i &quot;timeout&quot; /boot/limine.conf" language="bash" />

              <p>Make sure it is set to <code>timeout: 10</code> in <code>/boot/limine.conf</code>, then reboot.</p>
            </div>

            <div className="trouble-issue callout callout-danger-border">
              <div className="callout-header-row">
                <span className="callout-icon">⛔</span>
                <h3>Do NOT install GRUB just for this</h3>
              </div>
              <p>Limine is Omarchy's native bootloader. Do not attempt to replace Limine with GRUB — running <code>sudo limine-scan</code> and setting <code>efibootmgr</code> is all that is required for dual-booting.</p>
            </div>
          </section>

          {/* Quick Copy-Paste Checklist */}
          <section id="quick-checklist" className="content-card checklist-card">
            <div className="section-title-group">
              <span className="section-icon">⚡</span>
              <h2>Quick Terminal Command Checklist</h2>
            </div>

            <p className="checklist-intro">Execute these terminal commands in order inside Omarchy to configure your boot menu:</p>

            <div className="big-copy-header">
              <span className="big-copy-title">Complete Terminal Command Script</span>
              <button className="big-copy-btn" onClick={copyFullScript}>
                {scriptCopied ? (
                  <>
                    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Copied Entire Script!</span>
                  </>
                ) : (
                  <>
                    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy Entire Script at Once</span>
                  </>
                )}
              </button>
            </div>

            <CodeBlock code={FULL_CHECKLIST_SCRIPT} language="bash" title="configure-boot-menu.sh" />
          </section>

          {/* Target Result */}
          <section id="target-result" className="content-card">
            <div className="section-title-group">
              <span className="section-icon">🎯</span>
              <h2>Target Boot Result</h2>
            </div>

            <p className="diagram-title">When configured, turning on your laptop will present this sequence:</p>
            <div className="diagram-box">
              <pre>{`Power On
   ↓
UEFI Firmware
   ↓
Limine Bootloader
   ↓
┌──────────────────────────────────────┐
│  Limine Menu (10-Second Countdown)  │
│  ├─ Omarchy                          │
│  └─ Windows Boot Manager             │
└──────────────────────────────────────┘`}</pre>
            </div>
          </section>

          {/* Official References */}
          <section id="references" className="content-card references-card">
            <div className="section-title-group">
              <span className="section-icon">📚</span>
              <h2>Official References</h2>
            </div>

            <ul className="reference-links">
              <li>
                <span className="ref-bullet">🔗</span>
                <span className="ref-label">Omarchy Dual Boot Guide:</span>
                <a href="https://omarchy.org/manual/dual-boot-install/" target="_blank" rel="noopener noreferrer">
                  https://omarchy.org/manual/dual-boot-install/
                </a>
              </li>
              <li>
                <span className="ref-bullet">🔗</span>
                <span className="ref-label">Omarchy Getting Started:</span>
                <a href="https://omarchy.org/manual/getting-started/" target="_blank" rel="noopener noreferrer">
                  https://omarchy.org/manual/getting-started/
                </a>
              </li>
              <li>
                <span className="ref-bullet">🔗</span>
                <span className="ref-label">Omarchy Manual:</span>
                <a href="https://omarchy.org/manual/" target="_blank" rel="noopener noreferrer">
                  https://omarchy.org/manual/
                </a>
              </li>
            </ul>
          </section>

          {/* Footer */}
          <footer className="site-footer">
            <p>Omarchy Dual-Boot Menu Setup Guide • Powered by Limine Bootloader</p>
          </footer>

        </main>
      </div>
    </div>
  );
}

export default App;
