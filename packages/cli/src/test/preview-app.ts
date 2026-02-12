/**
 * Generates a standalone HTML page that renders a single error entry.
 * All CSS and JS are inlined — no external dependencies.
 * Query params:
 *   ?trackId=XXX — which error to render
 *   &port=YYYY   — preview server port for fetching config/variables
 */
export function buildPreviewHtml(port: number): string {
  return /* html */ `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>huh preview</title>
<style>
${PREVIEW_CSS}
</style>
</head>
<body>
<div id="error-container"></div>
<script>
${PREVIEW_JS(port)}
</script>
</body>
</html>`;
}

// ── Inlined CSS (based on examples/react/src/style.css) ──

const PREVIEW_CSS = `
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
  min-height: 100vh;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: #e53e3e;
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.modal p {
  color: #555;
  margin-bottom: 1.25rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: #333;
  color: #fff;
  font-size: 0.8125rem;
  cursor: pointer;
}

.modal-actions .btn-secondary {
  background: #e2e8f0;
  color: #333;
}

/* Page */
.error-page {
  position: fixed;
  inset: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  animation: fade-in 0.3s ease-out;
}

.error-page img {
  width: 200px;
  margin-bottom: 1.5rem;
}

.error-page h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.error-page p {
  color: #666;
  margin-bottom: 1.5rem;
}

.error-page button,
button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: #333;
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}
`;

// ── Inlined JS (resolveError + renderTemplate + DOM renderers) ──

function PREVIEW_JS(port: number): string {
  return `
(async function() {
  var PORT = ${port};
  var params = new URLSearchParams(location.search);
  var trackId = params.get('trackId');
  if (!trackId) {
    document.body.textContent = 'Missing ?trackId= parameter';
    return;
  }

  // Fetch config and variables from preview server
  var configRes = await fetch('http://localhost:' + PORT + '/__huh__/config.json');
  var config = await configRes.json();

  var varsRes = await fetch('http://localhost:' + PORT + '/__huh__/variables.json?trackId=' + encodeURIComponent(trackId));
  var variables = await varsRes.json();

  // resolveError inline
  var entry = config[trackId];
  if (!entry) {
    document.body.textContent = 'Unknown trackId: ' + trackId;
    return;
  }

  function renderTemplate(template, vars) {
    return template.replace(/\\{\\{(\\w+)\\}\\}/g, function(match, key) {
      return key in vars ? vars[key] : match;
    });
  }

  var resolved = {
    trackId: trackId,
    type: entry.type,
    message: renderTemplate(entry.message, variables),
    title: entry.title ? renderTemplate(entry.title, variables) : undefined,
    image: entry.image,
    action: entry.action ? {
      label: renderTemplate(entry.action.label, variables),
      type: entry.action.type,
      target: entry.action.target ? renderTemplate(entry.action.target, variables) : undefined
    } : undefined
  };

  var container = document.getElementById('error-container');

  function renderToast(err) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('data-huh-type', 'TOAST');
    toast.setAttribute('data-huh-track-id', err.trackId);
    toast.textContent = err.message;
    container.appendChild(toast);
  }

  function renderModal(err) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('data-huh-type', 'MODAL');
    overlay.setAttribute('data-huh-track-id', err.trackId);

    var modal = document.createElement('div');
    modal.className = 'modal';

    if (err.title) {
      var title = document.createElement('h2');
      title.textContent = err.title;
      modal.appendChild(title);
    }

    var message = document.createElement('p');
    message.textContent = err.message;
    modal.appendChild(message);

    var actions = document.createElement('div');
    actions.className = 'modal-actions';

    var dismissBtn = document.createElement('button');
    dismissBtn.className = 'btn-secondary';
    dismissBtn.textContent = '\\uB2EB\\uAE30';
    actions.appendChild(dismissBtn);

    if (err.action) {
      var actionBtn = document.createElement('button');
      actionBtn.textContent = err.action.label;
      actions.appendChild(actionBtn);
    }

    modal.appendChild(actions);
    overlay.appendChild(modal);
    container.appendChild(overlay);
  }

  function renderPage(err) {
    var page = document.createElement('div');
    page.className = 'error-page';
    page.setAttribute('data-huh-type', 'PAGE');
    page.setAttribute('data-huh-track-id', err.trackId);

    if (err.image) {
      var img = document.createElement('img');
      img.src = err.image;
      img.alt = '';
      page.appendChild(img);
    }

    if (err.title) {
      var h1 = document.createElement('h1');
      h1.textContent = err.title;
      page.appendChild(h1);
    }

    var p = document.createElement('p');
    p.textContent = err.message;
    page.appendChild(p);

    if (err.action) {
      var btn = document.createElement('button');
      btn.textContent = err.action.label;
      page.appendChild(btn);
    }

    container.appendChild(page);
  }

  var renderers = {
    TOAST: renderToast,
    MODAL: renderModal,
    PAGE: renderPage
  };

  var render = renderers[resolved.type.toUpperCase()];
  if (render) {
    render(resolved);
  } else {
    // Fallback: render as modal for custom types
    renderModal(resolved);
  }

  // Mark as rendered
  container.setAttribute('data-huh-rendered', 'true');
})();
`;
}
