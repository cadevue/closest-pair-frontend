const logsElement = document.getElementById('logs') as HTMLElement;

export function domLog(message: string) {
    const logEntry = document.createElement('span');
    logEntry.innerHTML = message;
    logsElement.appendChild(logEntry);
    logsElement.appendChild(document.createElement('br'));
}

export function clearDOMLogs() {
    logsElement.innerHTML = '';
}