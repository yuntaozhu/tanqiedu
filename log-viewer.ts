
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { logger, LogEntry } from './logger';

@customElement('gdm-log-viewer')
export class GdmLogViewer extends LitElement {
  @state() logs: LogEntry[] = [];
  @state() isOpen = false;
  private unsubscribe: (() => void) | null = null;

  static styles = css`
    :host {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9999;
      font-family: monospace;
      font-size: 12px;
      pointer-events: none; /* Allow clicking through when closed */
    }

    .toggle-btn {
      pointer-events: auto;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }
    
    .toggle-btn:hover {
      transform: scale(1.1);
      background: rgba(0, 0, 0, 0.9);
    }
    
    .toggle-btn.error {
      background: #D32F2F;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
      100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
    }

    .container {
      pointer-events: auto;
      position: absolute;
      bottom: 50px;
      left: 0;
      width: 80vw;
      max-width: 600px;
      height: 50vh;
      background: rgba(30, 30, 30, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 1px solid #444;
      transition: opacity 0.2s, transform 0.2s;
      transform-origin: bottom left;
    }

    .container.closed {
      opacity: 0;
      transform: scale(0.9);
      pointer-events: none;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #252526;
      border-bottom: 1px solid #333;
      color: #ccc;
    }

    .title {
      font-weight: bold;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      background: #444;
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
    }

    .action-btn:hover {
      background: #555;
    }

    .log-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .log-entry {
      padding: 6px;
      border-radius: 4px;
      background: rgba(255,255,255,0.05);
      color: #ddd;
      border-left: 3px solid transparent;
      word-break: break-all;
    }

    .log-entry.info { border-left-color: #2196F3; }
    .log-entry.warn { border-left-color: #FF9800; color: #FFE0B2; }
    .log-entry.error { border-left-color: #F44336; background: rgba(244, 67, 54, 0.1); color: #FFCDD2; }
    .log-entry.debug { border-left-color: #9C27B0; color: #E1BEE7; }

    .timestamp {
      color: #888;
      margin-right: 8px;
      font-size: 10px;
    }

    .details {
      margin-top: 4px;
      background: rgba(0,0,0,0.3);
      padding: 4px;
      border-radius: 2px;
      white-space: pre-wrap;
      font-size: 10px;
      overflow-x: auto;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = logger.subscribe((logs) => {
      this.logs = [...logs];
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  private clearLogs() {
    logger.clear();
  }

  private copyLogs() {
    const text = this.logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert('Logs copied to clipboard');
    });
  }

  private formatDetail(detail: any): string {
    if (typeof detail === 'object') {
      try {
        if (detail instanceof Error) {
            return detail.stack || detail.message;
        }
        return JSON.stringify(detail, null, 2);
      } catch (e) {
        return String(detail);
      }
    }
    return String(detail);
  }

  private hasRecentErrors() {
    // Check if there are errors in the last 10 logs
    return this.logs.slice(0, 10).some(l => l.level === 'error');
  }

  render() {
    return html`
      <div class="toggle-btn ${this.hasRecentErrors() ? 'error' : ''}" @click="${this.toggleOpen}" title="System Logs">
        ${this.hasRecentErrors() ? '⚠️' : '🐞'}
      </div>

      <div class="container ${this.isOpen ? '' : 'closed'}">
        <div class="header">
          <span class="title">System Logs (${this.logs.length})</span>
          <div class="actions">
            <button class="action-btn" @click="${this.copyLogs}">Copy</button>
            <button class="action-btn" @click="${this.clearLogs}">Clear</button>
            <button class="action-btn" @click="${this.toggleOpen}">Close</button>
          </div>
        </div>
        <div class="log-list">
          ${this.logs.length === 0 ? html`<div style="color: #666; text-align: center; padding: 20px;">No logs yet</div>` : nothing}
          ${this.logs.map(log => html`
            <div class="log-entry ${log.level}">
              <span class="timestamp">${log.timestamp}</span>
              <span class="message">${log.message}</span>
              ${log.details && log.details.length > 0 ? html`
                <div class="details">
                  ${log.details.map(d => this.formatDetail(d)).join('\n')}
                </div>
              ` : nothing}
            </div>
          `)}
        </div>
      </div>
    `;
  }
}
