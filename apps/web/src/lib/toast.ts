// Global toast utility — works without React context
// Creates a floating toast notification without needing the ToastProvider

type ToastType = 'success' | 'error' | 'warning' | 'info';

const COLORS: Record<ToastType, string> = {
  success: 'rgba(16,185,129,0.95)',
  error: 'rgba(239,68,68,0.95)',
  warning: 'rgba(245,158,11,0.95)',
  info: 'rgba(99,102,241,0.95)',
};

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function toast(message: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return;

  // Get or create container
  let container = document.getElementById('global-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-toast-container';
    Object.assign(container.style, {
      position: 'fixed', bottom: '24px', right: '24px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      zIndex: '9999', pointerEvents: 'none',
    });
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  Object.assign(el.style, {
    pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 18px', borderRadius: '10px', background: COLORS[type],
    color: 'white', fontSize: '13px', fontWeight: '500', fontFamily: 'Inter, sans-serif',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)',
    cursor: 'pointer', minWidth: '240px', maxWidth: '400px',
    opacity: '0', transform: 'translateY(8px) scale(0.96)',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  });
  el.innerHTML = `<span style="font-size:16px">${ICONS[type]}</span><span style="flex:1">${message}</span><span style="opacity:0.5;font-size:14px;font-weight:700">×</span>`;
  el.onclick = () => dismiss();
  container.appendChild(el);

  // Animate in
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0) scale(1)';
  });

  const dismiss = () => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px) scale(0.96)';
    setTimeout(() => el.remove(), 250);
  };

  // Auto-dismiss
  setTimeout(dismiss, 3500);
}

export default toast;
