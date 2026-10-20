import './styles/main.css';

function initializeApp(): void {
    const app: HTMLDivElement | null =
        document.querySelector<HTMLDivElement>('#app');

    if (app === null) {
        throw new Error('Application root not found.');
    }

    const heading: HTMLHeadingElement =
        document.createElement('h1');

    heading.textContent = 'CentiCopia';

    const description: HTMLParagraphElement =
        document.createElement('p');

    description.textContent =
        'Your finances. Your data. Your control.';

    app.append(heading, description);
}

initializeApp();
