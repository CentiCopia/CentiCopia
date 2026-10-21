import './styles/main.css';

type DatabaseResponse =
  | {
    type: 'ready';
    version: string;
    schemaVersion: number;
    accountCount: number;
    defaultBudget: string;
  }
  | {
    type: 'error';
    message: string;
  };

function initializeApp(): void {
  const app: HTMLDivElement | null =
    document.querySelector<HTMLDivElement>('#app');

  if (app === null) {
    throw new Error('Application root not found.');
  }

  const heading: HTMLHeadingElement =
    document.createElement('h1');

  heading.textContent = 'CentiCopia';

  const status: HTMLParagraphElement = document.createElement('p');
  status.textContent = 'Initializing database...';

  app.replaceChildren(heading, status)

  const worker: Worker = new Worker(
    new URL('./db/sqlite.worker.ts', import.meta.url),
    { type: 'module' }
  );

  worker.onmessage = (event: MessageEvent<DatabaseResponse>): void => {
    const response: DatabaseResponse = event.data

    if (response.type === 'error') {
      status.textContent =
        `Database error: ${response.message}`;
    } else {
      status.textContent =
        `SQLite ${response.version} initialized.\n` +
        `Schema version: ${response.schemaVersion}\n` +
        `Accounts: ${response.accountCount}\n` +
        `Default budget: ${response.defaultBudget}`;
    }

    worker.terminate();
  };

  worker.onerror = (event: ErrorEvent): void => {
    status.textContent = `Database worker error: ${event.message}`

    worker.terminate()
  };
}

initializeApp();
